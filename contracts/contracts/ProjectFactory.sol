// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/token/ERC721/ERC721.sol";

/**
 * @title ProjectFactory
 * @dev Main factory contract for creating and managing crowdfunding projects
 */
contract ProjectFactory is Ownable, ReentrancyGuard {
    
    // Structs
    struct Project {
        address payable creator;
        string title;
        string description;
        string category;
        string imageURI;
        uint256 goalAmount;
        uint256 currentAmount;
        uint256 deadline;
        uint256 createdAt;
        ProjectStatus status;
        address projectContract;
    }
    
    struct Milestone {
        string title;
        string description;
        uint256 amount;
        bool completed;
        bool verified;
        uint256 votesFor;
        uint256 votesAgainst;
    }
    
    enum ProjectStatus {
        Active,
        Funded,
        Failed,
        Completed
    }
    
    // State variables
    uint256 public projectCount;
    uint256 public platformFeePercentage = 2; // 2% platform fee
    
    mapping(uint256 => Project) public projects;
    mapping(uint256 => Milestone[]) public projectMilestones;
    mapping(uint256 => mapping(address => uint256)) public contributions;
    mapping(uint256 => address[]) public projectBackers;
    
    // Events
    event ProjectCreated(
        uint256 indexed projectId,
        address indexed creator,
        string title,
        uint256 goalAmount,
        uint256 deadline
    );
    
    event ContributionMade(
        uint256 indexed projectId,
        address indexed backer,
        uint256 amount
    );
    
    event MilestoneCompleted(
        uint256 indexed projectId,
        uint256 milestoneIndex
    );
    
    event FundsReleased(
        uint256 indexed projectId,
        uint256 amount,
        uint256 milestoneIndex
    );
    
    event ProjectStatusChanged(
        uint256 indexed projectId,
        ProjectStatus newStatus
    );
    
    event RefundIssued(
        uint256 indexed projectId,
        address indexed backer,
        uint256 amount
    );
    
    // Modifiers
    modifier onlyProjectCreator(uint256 _projectId) {
        require(
            projects[_projectId].creator == msg.sender,
            "Not project creator"
        );
        _;
    }
    
    modifier projectExists(uint256 _projectId) {
        require(_projectId > 0 && _projectId <= projectCount, "Project does not exist");
        _;
    }
    
    modifier projectActive(uint256 _projectId) {
        require(
            projects[_projectId].status == ProjectStatus.Active,
            "Project not active"
        );
        require(
            block.timestamp < projects[_projectId].deadline,
            "Project deadline passed"
        );
        _;
    }
    
    constructor(address initialOwner) Ownable(initialOwner) {}
    
    /**
     * @dev Create a new crowdfunding project
     */
    function createProject(
        string memory _title,
        string memory _description,
        string memory _category,
        string memory _imageURI,
        uint256 _goalAmount,
        uint256 _durationDays,
        Milestone[] memory _milestones
    ) external returns (uint256) {
        require(_goalAmount > 0, "Goal must be greater than 0");
        require(_durationDays > 0 && _durationDays <= 60, "Duration must be 1-60 days");
        require(_milestones.length > 0, "At least one milestone required");
        
        // Validate milestones total equals goal
        uint256 totalMilestoneAmount = 0;
        for (uint i = 0; i < _milestones.length; i++) {
            totalMilestoneAmount += _milestones[i].amount;
        }
        require(totalMilestoneAmount == _goalAmount, "Milestones must equal goal");
        
        projectCount++;
        uint256 deadline = block.timestamp + (_durationDays * 1 days);
        
        projects[projectCount] = Project({
            creator: payable(msg.sender),
            title: _title,
            description: _description,
            category: _category,
            imageURI: _imageURI,
            goalAmount: _goalAmount,
            currentAmount: 0,
            deadline: deadline,
            createdAt: block.timestamp,
            status: ProjectStatus.Active,
            projectContract: address(this)
        });
        
        // Store milestones
        for (uint i = 0; i < _milestones.length; i++) {
            projectMilestones[projectCount].push(Milestone({
                title: _milestones[i].title,
                description: _milestones[i].description,
                amount: _milestones[i].amount,
                completed: false,
                verified: false,
                votesFor: 0,
                votesAgainst: 0
            }));
        }
        
        emit ProjectCreated(
            projectCount,
            msg.sender,
            _title,
            _goalAmount,
            deadline
        );
        
        return projectCount;
    }
    
    /**
     * @dev Contribute to a project
     */
    function contribute(uint256 _projectId) 
        external 
        payable 
        projectExists(_projectId) 
        projectActive(_projectId)
        nonReentrant 
    {
        require(msg.value > 0, "Contribution must be greater than 0");
        
        Project storage project = projects[_projectId];
        
        // Add to contributions
        if (contributions[_projectId][msg.sender] == 0) {
            projectBackers[_projectId].push(msg.sender);
        }
        contributions[_projectId][msg.sender] += msg.value;
        project.currentAmount += msg.value;
        
        // Check if goal reached
        if (project.currentAmount >= project.goalAmount) {
            project.status = ProjectStatus.Funded;
            emit ProjectStatusChanged(_projectId, ProjectStatus.Funded);
        }
        
        emit ContributionMade(_projectId, msg.sender, msg.value);
    }
    
    /**
     * @dev Submit milestone completion
     */
    function submitMilestone(
        uint256 _projectId,
        uint256 _milestoneIndex,
        string memory /* _proofURI */
    ) 
        external 
        projectExists(_projectId)
        onlyProjectCreator(_projectId) 
    {
        Project storage project = projects[_projectId];
        require(
            project.status == ProjectStatus.Funded,
            "Project must be funded"
        );
        
        Milestone storage milestone = projectMilestones[_projectId][_milestoneIndex];
        require(!milestone.completed, "Milestone already completed");
        
        milestone.completed = true;
        
        emit MilestoneCompleted(_projectId, _milestoneIndex);
    }
    
    /**
     * @dev Vote on milestone completion (by backers)
     */
    function voteOnMilestone(
        uint256 _projectId,
        uint256 _milestoneIndex,
        bool _approve
    ) 
        external 
        projectExists(_projectId) 
    {
        require(
            contributions[_projectId][msg.sender] > 0,
            "Must be a backer to vote"
        );
        
        Milestone storage milestone = projectMilestones[_projectId][_milestoneIndex];
        require(milestone.completed, "Milestone not submitted");
        require(!milestone.verified, "Milestone already verified");
        
        if (_approve) {
            milestone.votesFor += contributions[_projectId][msg.sender];
        } else {
            milestone.votesAgainst += contributions[_projectId][msg.sender];
        }
        
        // Auto-verify if majority approves (>50% of contributions)
        Project storage project = projects[_projectId];
        if (milestone.votesFor > project.currentAmount / 2) {
            milestone.verified = true;
            _releaseMilestoneFunds(_projectId, _milestoneIndex);
        }
    }
    
    /**
     * @dev Release funds for verified milestone
     */
    function _releaseMilestoneFunds(
        uint256 _projectId,
        uint256 _milestoneIndex
    ) internal {
        Project storage project = projects[_projectId];
        Milestone storage milestone = projectMilestones[_projectId][_milestoneIndex];
        
        require(milestone.verified, "Milestone not verified");
        
        uint256 platformFee = (milestone.amount * platformFeePercentage) / 100;
        uint256 creatorAmount = milestone.amount - platformFee;
        
        // Transfer funds
        project.creator.transfer(creatorAmount);
        payable(owner()).transfer(platformFee);
        
        emit FundsReleased(_projectId, creatorAmount, _milestoneIndex);
        
        // Check if all milestones completed
        bool allCompleted = true;
        for (uint i = 0; i < projectMilestones[_projectId].length; i++) {
            if (!projectMilestones[_projectId][i].verified) {
                allCompleted = false;
                break;
            }
        }
        
        if (allCompleted) {
            project.status = ProjectStatus.Completed;
            emit ProjectStatusChanged(_projectId, ProjectStatus.Completed);
        }
    }
    
    /**
     * @dev Refund backers if project fails
     */
    function refund(uint256 _projectId) 
        external 
        projectExists(_projectId)
        nonReentrant 
    {
        Project storage project = projects[_projectId];
        
        require(
            block.timestamp > project.deadline &&
            project.currentAmount < project.goalAmount,
            "Refund not available"
        );
        
        if (project.status == ProjectStatus.Active) {
            project.status = ProjectStatus.Failed;
            emit ProjectStatusChanged(_projectId, ProjectStatus.Failed);
        }
        
        uint256 contribution = contributions[_projectId][msg.sender];
        require(contribution > 0, "No contribution to refund");
        
        contributions[_projectId][msg.sender] = 0;
        payable(msg.sender).transfer(contribution);
        
        emit RefundIssued(_projectId, msg.sender, contribution);
    }
    
    /**
     * @dev Get project details
     */
    function getProject(uint256 _projectId) 
        external 
        view 
        projectExists(_projectId)
        returns (Project memory) 
    {
        return projects[_projectId];
    }
    
    /**
     * @dev Get project milestones
     */
    function getProjectMilestones(uint256 _projectId)
        external
        view
        projectExists(_projectId)
        returns (Milestone[] memory)
    {
        return projectMilestones[_projectId];
    }
    
    /**
     * @dev Get project backers
     */
    function getProjectBackers(uint256 _projectId)
        external
        view
        projectExists(_projectId)
        returns (address[] memory)
    {
        return projectBackers[_projectId];
    }
    
    /**
     * @dev Get backer contribution
     */
    function getContribution(uint256 _projectId, address _backer)
        external
        view
        projectExists(_projectId)
        returns (uint256)
    {
        return contributions[_projectId][_backer];
    }
    
    /**
     * @dev Update platform fee (only owner)
     */
    function setPlatformFee(uint256 _newFee) external onlyOwner {
        require(_newFee <= 5, "Fee cannot exceed 5%");
        platformFeePercentage = _newFee;
    }
}