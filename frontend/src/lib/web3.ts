import { ethers } from 'ethers';
import contractConfig from '../config/contracts.json';
import ProjectFactoryABI from '../../../contracts/artifacts/contracts/ProjectFactory.sol/ProjectFactory.json';
import RewardNFTABI from '../../../contracts/artifacts/contracts/RewardNFT.sol/RewardNFT.json';

export interface Project {
  id: number;
  creator: string;
  title: string;
  description: string;
  category: string;
  imageURI: string;
  goalAmount: bigint;
  currentAmount: bigint;
  deadline: number;
  createdAt: number;
  status: number;
}

export interface Milestone {
  title: string;
  description: string;
  amount: bigint;
  completed: boolean;
  verified: boolean;
  votesFor: bigint;
  votesAgainst: bigint;
}

export class Web3Service {
  private provider: ethers.BrowserProvider | null = null;
  private signer: ethers.Signer | null = null;
  private projectFactory: ethers.Contract | null = null;
  private rewardNFT: ethers.Contract | null = null;

  async connect(): Promise<string> {
    if (!window.ethereum) {
      throw new Error('MetaMask not installed');
    }

    try {
      this.provider = new ethers.BrowserProvider(window.ethereum);
      const accounts = await this.provider.send('eth_requestAccounts', []);
      this.signer = await this.provider.getSigner();

      // Initialize contracts
      this.projectFactory = new ethers.Contract(
        contractConfig.contractAddresses.projectFactory,
        ProjectFactoryABI.abi,
        this.signer
      );

      this.rewardNFT = new ethers.Contract(
        contractConfig.contractAddresses.rewardNFT,
        RewardNFTABI.abi,
        this.signer
      );

      return accounts[0];
    } catch (error) {
      console.error('Connection error:', error);
      throw error;
    }
  }

  async disconnect(): Promise<void> {
    this.provider = null;
    this.signer = null;
    this.projectFactory = null;
    this.rewardNFT = null;
  }

  async getAccount(): Promise<string | null> {
    if (!this.signer) return null;
    return await this.signer.getAddress();
  }

  async getBalance(address?: string): Promise<string> {
    if (!this.provider) throw new Error('Not connected');
    const addr = address || await this.signer!.getAddress();
    const balance = await this.provider.getBalance(addr);
    return ethers.formatEther(balance);
  }

  async getNetworkInfo() {
    if (!this.provider) throw new Error('Not connected');
    const network = await this.provider.getNetwork();
    return {
      chainId: Number(network.chainId),
      name: network.name,
    };
  }

  // Project Functions
  async createProject(
    title: string,
    description: string,
    category: string,
    imageURI: string,
    goalAmount: string,
    durationDays: number,
    milestones: Array<{
      title: string;
      description: string;
      amount: string;
    }>
  ): Promise<ethers.ContractTransactionResponse> {
    if (!this.projectFactory) throw new Error('Not connected');

    const goalWei = ethers.parseEther(goalAmount);
    const milestonesFormatted = milestones.map(m => ({
      title: m.title,
      description: m.description,
      amount: ethers.parseEther(m.amount),
      completed: false,
      verified: false,
      votesFor: 0,
      votesAgainst: 0,
    }));

    const tx = await this.projectFactory.createProject(
      title,
      description,
      category,
      imageURI,
      goalWei,
      durationDays,
      milestonesFormatted
    );

    return tx;
  }

  async getProject(projectId: number): Promise<Project> {
    if (!this.projectFactory) throw new Error('Not connected');
    
    const project = await this.projectFactory.getProject(projectId);
    return {
      id: projectId,
      creator: project.creator,
      title: project.title,
      description: project.description,
      category: project.category,
      imageURI: project.imageURI,
      goalAmount: project.goalAmount,
      currentAmount: project.currentAmount,
      deadline: Number(project.deadline),
      createdAt: Number(project.createdAt),
      status: Number(project.status),
    };
  }

  async getProjectCount(): Promise<number> {
    if (!this.projectFactory) throw new Error('Not connected');
    const count = await this.projectFactory.projectCount();
    return Number(count);
  }

  async getAllProjects(): Promise<Project[]> {
    const count = await this.getProjectCount();
    const projects: Project[] = [];

    for (let i = 1; i <= count; i++) {
      try {
        const project = await this.getProject(i);
        projects.push(project);
      } catch (error) {
        console.error(`Error fetching project ${i}:`, error);
      }
    }

    return projects;
  }

  async getProjectMilestones(projectId: number): Promise<Milestone[]> {
    if (!this.projectFactory) throw new Error('Not connected');
    return await this.projectFactory.getProjectMilestones(projectId);
  }

  async contribute(
    projectId: number,
    amount: string
  ): Promise<ethers.ContractTransactionResponse> {
    if (!this.projectFactory) throw new Error('Not connected');

    const amountWei = ethers.parseEther(amount);
    const tx = await this.projectFactory.contribute(projectId, {
      value: amountWei,
    });

    return tx;
  }

  async getContribution(projectId: number, backer?: string): Promise<string> {
    if (!this.projectFactory) throw new Error('Not connected');
    
    const backerAddress = backer || await this.signer!.getAddress();
    const contribution = await this.projectFactory.getContribution(
      projectId,
      backerAddress
    );
    
    return ethers.formatEther(contribution);
  }

  async getProjectBackers(projectId: number): Promise<string[]> {
    if (!this.projectFactory) throw new Error('Not connected');
    return await this.projectFactory.getProjectBackers(projectId);
  }

  async submitMilestone(
    projectId: number,
    milestoneIndex: number,
    proofURI: string
  ): Promise<ethers.ContractTransactionResponse> {
    if (!this.projectFactory) throw new Error('Not connected');

    const tx = await this.projectFactory.submitMilestone(
      projectId,
      milestoneIndex,
      proofURI
    );

    return tx;
  }

  async voteOnMilestone(
    projectId: number,
    milestoneIndex: number,
    approve: boolean
  ): Promise<ethers.ContractTransactionResponse> {
    if (!this.projectFactory) throw new Error('Not connected');

    const tx = await this.projectFactory.voteOnMilestone(
      projectId,
      milestoneIndex,
      approve
    );

    return tx;
  }

  async refund(projectId: number): Promise<ethers.ContractTransactionResponse> {
    if (!this.projectFactory) throw new Error('Not connected');

    const tx = await this.projectFactory.refund(projectId);
    return tx;
  }

  // NFT Functions
  async getBackerNFTs(projectId: number, backer?: string): Promise<number[]> {
    if (!this.rewardNFT) throw new Error('Not connected');
    
    const backerAddress = backer || await this.signer!.getAddress();
    const nfts = await this.rewardNFT.getBackerNFTs(projectId, backerAddress);
    
    return nfts.map((n: bigint) => Number(n));
  }

  async getNFTMetadata(tokenId: number) {
    if (!this.rewardNFT) throw new Error('Not connected');
    return await this.rewardNFT.getNFTMetadata(tokenId);
  }

  async getNFTBalance(address?: string): Promise<number> {
    if (!this.rewardNFT) throw new Error('Not connected');
    
    const addr = address || await this.signer!.getAddress();
    const balance = await this.rewardNFT.balanceOf(addr);
    
    return Number(balance);
  }

  // Event Listeners
  onProjectCreated(callback: (projectId: number, creator: string) => void) {
    if (!this.projectFactory) throw new Error('Not connected');

    this.projectFactory.on('ProjectCreated', (projectId, creator) => {
      callback(Number(projectId), creator);
    });
  }

  onContribution(callback: (projectId: number, backer: string, amount: bigint) => void) {
    if (!this.projectFactory) throw new Error('Not connected');

    this.projectFactory.on('ContributionMade', (projectId, backer, amount) => {
      callback(Number(projectId), backer, amount);
    });
  }

  onMilestoneCompleted(callback: (projectId: number, milestoneIndex: number) => void) {
    if (!this.projectFactory) throw new Error('Not connected');

    this.projectFactory.on('MilestoneCompleted', (projectId, milestoneIndex) => {
      callback(Number(projectId), Number(milestoneIndex));
    });
  }

  removeAllListeners() {
    if (this.projectFactory) {
      this.projectFactory.removeAllListeners();
    }
    if (this.rewardNFT) {
      this.rewardNFT.removeAllListeners();
    }
  }

  // Utility Functions
  formatEther(wei: bigint): string {
    return ethers.formatEther(wei);
  }

  parseEther(ether: string): bigint {
    return ethers.parseEther(ether);
  }

  getProjectStatus(status: number): string {
    const statuses = ['Active', 'Funded', 'Failed', 'Completed'];
    return statuses[status] || 'Unknown';
  }

  isProjectActive(deadline: number): boolean {
    return Date.now() / 1000 < deadline;
  }

  getDaysLeft(deadline: number): number {
    const now = Date.now() / 1000;
    const secondsLeft = deadline - now;
    return Math.max(0, Math.ceil(secondsLeft / (24 * 60 * 60)));
  }

  getProgressPercentage(current: bigint, goal: bigint): number {
    if (goal === 0n) return 0;
    return Number((current * 100n) / goal);
  }
}

// Export singleton instance
export const web3Service = new Web3Service();

// Type declarations for window.ethereum
declare global {
  interface Window {
    ethereum?: any;
  }
}