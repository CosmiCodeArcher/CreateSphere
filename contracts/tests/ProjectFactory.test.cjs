const { expect } = require("chai");
const { ethers } = require("hardhat");
const { time, loadFixture } = require("@nomicfoundation/hardhat-network-helpers");

describe("CreateSphere Platform", function () {
  // Fixture for deploying contracts
  async function deployContractsFixture() {
    const [owner, creator, backer1, backer2, backer3] = await ethers.getSigners();

    const ProjectFactory = await ethers.getContractFactory("ProjectFactory");
    const projectFactory = await ProjectFactory.deploy(owner.address);

    const RewardNFT = await ethers.getContractFactory("RewardNFT");
    const rewardNFT = await RewardNFT.deploy(await projectFactory.getAddress(), owner.address);

    return { projectFactory, rewardNFT, owner, creator, backer1, backer2, backer3 };
  }

  describe("ProjectFactory Deployment", function () {
    it("Should set the right owner", async function () {
      const { projectFactory, owner } = await loadFixture(deployContractsFixture);
      expect(await projectFactory.owner()).to.equal(owner.address);
    });

    it("Should initialize with zero projects", async function () {
      const { projectFactory } = await loadFixture(deployContractsFixture);
      expect(await projectFactory.projectCount()).to.equal(0);
    });

    it("Should set default platform fee to 2%", async function () {
      const { projectFactory } = await loadFixture(deployContractsFixture);
      expect(await projectFactory.platformFeePercentage()).to.equal(2);
    });
  });

  describe("Project Creation", function () {
    it("Should create a project with valid parameters", async function () {
      const { projectFactory, creator } = await loadFixture(deployContractsFixture);

      const milestones = [
        { title: "Phase 1", description: "Development", amount: ethers.parseEther("5"), completed: false, verified: false, votesFor: 0, votesAgainst: 0 },
        { title: "Phase 2", description: "Testing", amount: ethers.parseEther("5"), completed: false, verified: false, votesFor: 0, votesAgainst: 0 },
      ];

      await expect(
        projectFactory.connect(creator).createProject(
          "Test Project",
          "A test project description",
          "Art",
          "ipfs://test",
          ethers.parseEther("10"),
          30,
          milestones
        )
      ).to.emit(projectFactory, "ProjectCreated");

      expect(await projectFactory.projectCount()).to.equal(1);
    });

    it("Should fail with zero goal amount", async function () {
      const { projectFactory, creator } = await loadFixture(deployContractsFixture);

      const milestones = [
        { title: "Phase 1", description: "Dev", amount: 0, completed: false, verified: false, votesFor: 0, votesAgainst: 0 },
      ];

      await expect(
        projectFactory.connect(creator).createProject(
          "Test Project",
          "Description",
          "Art",
          "ipfs://test",
          0,
          30,
          milestones
        )
      ).to.be.revertedWith("Goal must be greater than 0");
    });

    it("Should fail with invalid duration", async function () {
      const { projectFactory, creator } = await loadFixture(deployContractsFixture);

      const milestones = [
        { title: "Phase 1", description: "Dev", amount: ethers.parseEther("10"), completed: false, verified: false, votesFor: 0, votesAgainst: 0 },
      ];

      await expect(
        projectFactory.connect(creator).createProject(
          "Test Project",
          "Description",
          "Art",
          "ipfs://test",
          ethers.parseEther("10"),
          0,
          milestones
        )
      ).to.be.revertedWith("Duration must be 1-60 days");
    });

    it("Should fail if milestones don't equal goal", async function () {
      const { projectFactory, creator } = await loadFixture(deployContractsFixture);

      const milestones = [
        { title: "Phase 1", description: "Dev", amount: ethers.parseEther("5"), completed: false, verified: false, votesFor: 0, votesAgainst: 0 },
      ];

      await expect(
        projectFactory.connect(creator).createProject(
          "Test Project",
          "Description",
          "Art",
          "ipfs://test",
          ethers.parseEther("10"),
          30,
          milestones
        )
      ).to.be.revertedWith("Milestones must equal goal");
    });
  });

  describe("Contributions", function () {
    it("Should accept contributions to active project", async function () {
      const { projectFactory, creator, backer1 } = await loadFixture(deployContractsFixture);

      const milestones = [
        { title: "Phase 1", description: "Dev", amount: ethers.parseEther("10"), completed: false, verified: false, votesFor: 0, votesAgainst: 0 },
      ];

      await projectFactory.connect(creator).createProject(
        "Test Project",
        "Description",
        "Art",
        "ipfs://test",
        ethers.parseEther("10"),
        30,
        milestones
      );

      await expect(
        projectFactory.connect(backer1).contribute(1, { value: ethers.parseEther("1") })
      ).to.emit(projectFactory, "ContributionMade")
        .withArgs(1, backer1.address, ethers.parseEther("1"));

      const project = await projectFactory.getProject(1);
      expect(project.currentAmount).to.equal(ethers.parseEther("1"));
    });

    it("Should track multiple backers", async function () {
      const { projectFactory, creator, backer1, backer2 } = await loadFixture(deployContractsFixture);

      const milestones = [
        { title: "Phase 1", description: "Dev", amount: ethers.parseEther("10"), completed: false, verified: false, votesFor: 0, votesAgainst: 0 },
      ];

      await projectFactory.connect(creator).createProject(
        "Test Project",
        "Description",
        "Art",
        "ipfs://test",
        ethers.parseEther("10"),
        30,
        milestones
      );

      await projectFactory.connect(backer1).contribute(1, { value: ethers.parseEther("3") });
      await projectFactory.connect(backer2).contribute(1, { value: ethers.parseEther("2") });

      const backers = await projectFactory.getProjectBackers(1);
      expect(backers.length).to.equal(2);
      expect(backers).to.include(backer1.address);
      expect(backers).to.include(backer2.address);

      expect(await projectFactory.getContribution(1, backer1.address)).to.equal(ethers.parseEther("3"));
      expect(await projectFactory.getContribution(1, backer2.address)).to.equal(ethers.parseEther("2"));
    });

    it("Should mark project as funded when goal reached", async function () {
      const { projectFactory, creator, backer1 } = await loadFixture(deployContractsFixture);

      const milestones = [
        { title: "Phase 1", description: "Dev", amount: ethers.parseEther("10"), completed: false, verified: false, votesFor: 0, votesAgainst: 0 },
      ];

      await projectFactory.connect(creator).createProject(
        "Test Project",
        "Description",
        "Art",
        "ipfs://test",
        ethers.parseEther("10"),
        30,
        milestones
      );

      await projectFactory.connect(backer1).contribute(1, { value: ethers.parseEther("10") });

      const project = await projectFactory.getProject(1);
      expect(project.status).to.equal(1); // ProjectStatus.Funded
    });

    it("Should reject zero contributions", async function () {
      const { projectFactory, creator, backer1 } = await loadFixture(deployContractsFixture);

      const milestones = [
        { title: "Phase 1", description: "Dev", amount: ethers.parseEther("10"), completed: false, verified: false, votesFor: 0, votesAgainst: 0 },
      ];

      await projectFactory.connect(creator).createProject(
        "Test Project",
        "Description",
        "Art",
        "ipfs://test",
        ethers.parseEther("10"),
        30,
        milestones
      );

      await expect(
        projectFactory.connect(backer1).contribute(1, { value: 0 })
      ).to.be.revertedWith("Contribution must be greater than 0");
    });
  });

  describe("Milestone Management", function () {
    it("Should allow creator to submit milestone", async function () {
      const { projectFactory, creator, backer1 } = await loadFixture(deployContractsFixture);

      const milestones = [
        { title: "Phase 1", description: "Dev", amount: ethers.parseEther("10"), completed: false, verified: false, votesFor: 0, votesAgainst: 0 },
      ];

      await projectFactory.connect(creator).createProject(
        "Test Project",
        "Description",
        "Art",
        "ipfs://test",
        ethers.parseEther("10"),
        30,
        milestones
      );

      await projectFactory.connect(backer1).contribute(1, { value: ethers.parseEther("10") });

      await expect(
        projectFactory.connect(creator).submitMilestone(1, 0, "ipfs://proof")
      ).to.emit(projectFactory, "MilestoneCompleted");

      const projectMilestones = await projectFactory.getProjectMilestones(1);
      expect(projectMilestones[0].completed).to.be.true;
    });

    it("Should allow backers to vote on milestone", async function () {
      const { projectFactory, creator, backer1, backer2 } = await loadFixture(deployContractsFixture);

      const milestones = [
        { title: "Phase 1", description: "Dev", amount: ethers.parseEther("10"), completed: false, verified: false, votesFor: 0, votesAgainst: 0 },
      ];

      await projectFactory.connect(creator).createProject(
        "Test Project",
        "Description",
        "Art",
        "ipfs://test",
        ethers.parseEther("10"),
        30,
        milestones
      );

      await projectFactory.connect(backer1).contribute(1, { value: ethers.parseEther("6") });
      await projectFactory.connect(backer2).contribute(1, { value: ethers.parseEther("4") });

      await projectFactory.connect(creator).submitMilestone(1, 0, "ipfs://proof");

      await projectFactory.connect(backer1).voteOnMilestone(1, 0, true);

      const projectMilestones = await projectFactory.getProjectMilestones(1);
      expect(projectMilestones[0].votesFor).to.equal(ethers.parseEther("6"));
    });

    it("Should release funds when milestone verified", async function () {
      const { projectFactory, creator, backer1, owner } = await loadFixture(deployContractsFixture);

      const milestones = [
        { title: "Phase 1", description: "Dev", amount: ethers.parseEther("10"), completed: false, verified: false, votesFor: 0, votesAgainst: 0 },
      ];

      await projectFactory.connect(creator).createProject(
        "Test Project",
        "Description",
        "Art",
        "ipfs://test",
        ethers.parseEther("10"),
        30,
        milestones
      );

      await projectFactory.connect(backer1).contribute(1, { value: ethers.parseEther("10") });

      const creatorBalanceBefore = await ethers.provider.getBalance(creator.address);

      await projectFactory.connect(creator).submitMilestone(1, 0, "ipfs://proof");

      await expect(
        projectFactory.connect(backer1).voteOnMilestone(1, 0, true)
      ).to.emit(projectFactory, "FundsReleased");

      const creatorBalanceAfter = await ethers.provider.getBalance(creator.address);
      
      // Creator should receive 98% (10 ETH - 2% platform fee)
      const expectedAmount = ethers.parseEther("9.8");
      expect(creatorBalanceAfter - creatorBalanceBefore).to.be.closeTo(
        expectedAmount,
        ethers.parseEther("0.1") // Allow small variance for gas
      );
    });
  });

  describe("Refunds", function () {
    it("Should allow refund when project fails", async function () {
      const { projectFactory, creator, backer1 } = await loadFixture(deployContractsFixture);

      const milestones = [
        { title: "Phase 1", description: "Dev", amount: ethers.parseEther("10"), completed: false, verified: false, votesFor: 0, votesAgainst: 0 },
      ];

      await projectFactory.connect(creator).createProject(
        "Test Project",
        "Description",
        "Art",
        "ipfs://test",
        ethers.parseEther("10"),
        1, // 1 day duration
        milestones
      );

      await projectFactory.connect(backer1).contribute(1, { value: ethers.parseEther("5") });

      // Fast forward time past deadline
      await time.increase(2 * 24 * 60 * 60); // 2 days

      const balanceBefore = await ethers.provider.getBalance(backer1.address);

      await expect(
        projectFactory.connect(backer1).refund(1)
      ).to.emit(projectFactory, "RefundIssued");

      const balanceAfter = await ethers.provider.getBalance(backer1.address);
      
      // Should receive full contribution back
      expect(balanceAfter - balanceBefore).to.be.closeTo(
        ethers.parseEther("5"),
        ethers.parseEther("0.01")
      );

      const project = await projectFactory.getProject(1);
      expect(project.status).to.equal(2); // ProjectStatus.Failed
    });

    it("Should not allow refund on successful project", async function () {
      const { projectFactory, creator, backer1 } = await loadFixture(deployContractsFixture);

      const milestones = [
        { title: "Phase 1", description: "Dev", amount: ethers.parseEther("10"), completed: false, verified: false, votesFor: 0, votesAgainst: 0 },
      ];

      await projectFactory.connect(creator).createProject(
        "Test Project",
        "Description",
        "Art",
        "ipfs://test",
        ethers.parseEther("10"),
        30,
        milestones
      );

      await projectFactory.connect(backer1).contribute(1, { value: ethers.parseEther("10") });

      await expect(
        projectFactory.connect(backer1).refund(1)
      ).to.be.revertedWith("Refund not available");
    });
  });

  describe("RewardNFT", function () {
    it("Should mint NFT reward for backer", async function () {
      const { rewardNFT, projectFactory, backer1 } = await loadFixture(deployContractsFixture);

      // Impersonate ProjectFactory to call mintReward
      await hre.network.provider.request({ method: "hardhat_impersonateAccount", params: [await projectFactory.getAddress()] });
      const factorySigner = await ethers.getSigner(await projectFactory.getAddress());

      // Fund the impersonated ProjectFactory account
      await hre.network.provider.send("hardhat_setBalance", [
        await projectFactory.getAddress(),
        "0x8AC7230489E80000", // Fund with 10 ETH in hex
      ]);

      await expect(
        rewardNFT.connect(factorySigner).mintReward(
          backer1.address,
          1,
          ethers.parseEther("1")
        )
      ).to.emit(rewardNFT, "RewardMinted");

      expect(await rewardNFT.balanceOf(backer1.address)).to.equal(1);

      // Stop impersonating
      await hre.network.provider.request({ method: "hardhat_stopImpersonatingAccount", params: [await projectFactory.getAddress()] });
    });

    it("Should calculate correct tier based on contribution", async function () {
      const { rewardNFT, projectFactory, backer1 } = await loadFixture(deployContractsFixture);

      // Impersonate ProjectFactory to call mintReward
      await hre.network.provider.request({ method: "hardhat_impersonateAccount", params: [await projectFactory.getAddress()] });
      const factorySigner = await ethers.getSigner(await projectFactory.getAddress());

      // Fund the impersonated ProjectFactory account
      await hre.network.provider.send("hardhat_setBalance", [
        await projectFactory.getAddress(),
        "0x8AC7230489E80000", // Fund with 10 ETH in hex
      ]);

      // Mint bronze tier (0.1 ETH)
      await rewardNFT.connect(factorySigner).mintReward(
        backer1.address,
        1,
        ethers.parseEther("0.1")
      );

      let metadata = await rewardNFT.getNFTMetadata(1);
      expect(metadata.tier).to.equal(1); // Bronze

      // Mint gold tier (1 ETH)
      await rewardNFT.connect(factorySigner).mintReward(
        backer1.address,
        1,
        ethers.parseEther("1")
      );

      metadata = await rewardNFT.getNFTMetadata(2);
      expect(metadata.tier).to.equal(3); // Gold

      // Stop impersonating
      await hre.network.provider.request({ method: "hardhat_stopImpersonatingAccount", params: [await projectFactory.getAddress()] });
    });

    it("Should track backer NFTs per project", async function () {
      const { rewardNFT, projectFactory, backer1 } = await loadFixture(deployContractsFixture);

      // Impersonate ProjectFactory to call mintReward
      await hre.network.provider.request({ method: "hardhat_impersonateAccount", params: [await projectFactory.getAddress()] });
      const factorySigner = await ethers.getSigner(await projectFactory.getAddress());

      // Fund the impersonated ProjectFactory account
      await hre.network.provider.send("hardhat_setBalance", [
        await projectFactory.getAddress(),
        "0x8AC7230489E80000", // Fund with 10 ETH in hex
      ]);

      await rewardNFT.connect(factorySigner).mintReward(
        backer1.address,
        1,
        ethers.parseEther("0.5")
      );

      await rewardNFT.connect(factorySigner).mintReward(
        backer1.address,
        1,
        ethers.parseEther("1")
      );

      const nfts = await rewardNFT.getBackerNFTs(1, backer1.address);
      expect(nfts.length).to.equal(2);

      // Stop impersonating
      await hre.network.provider.request({ method: "hardhat_stopImpersonatingAccount", params: [await projectFactory.getAddress()] });
    });
  });

  describe("Platform Management", function () {
    it("Should allow owner to update platform fee", async function () {
      const { projectFactory, owner } = await loadFixture(deployContractsFixture);

      await projectFactory.connect(owner).setPlatformFee(3);
      expect(await projectFactory.platformFeePercentage()).to.equal(3);
    });

    it("Should not allow fee above 5%", async function () {
      const { projectFactory, owner } = await loadFixture(deployContractsFixture);

      await expect(
        projectFactory.connect(owner).setPlatformFee(6)
      ).to.be.revertedWith("Fee cannot exceed 5%");
    });

    it("Should not allow non-owner to update fee", async function () {
      const { projectFactory, creator } = await loadFixture(deployContractsFixture);

      await expect(
        projectFactory.connect(creator).setPlatformFee(3)
      ).to.be.reverted;
    });
  });
});