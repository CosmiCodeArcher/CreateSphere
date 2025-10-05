import { useState, useEffect, useCallback } from 'react';
import { web3Service, Project } from '../lib/web3';
import { toast } from 'sonner';

interface Web3State {
  account: string | null;
  balance: string | null;
  chainId: number | null;
  isConnected: boolean;
  isConnecting: boolean;
}

export const useWeb3 = () => {
  const [state, setState] = useState<Web3State>({
    account: null,
    balance: null,
    chainId: null,
    isConnected: false,
    isConnecting: false,
  });

  const connect = useCallback(async () => {
    try {
      setState(prev => ({ ...prev, isConnecting: true }));
      
      const account = await web3Service.connect();
      const balance = await web3Service.getBalance();
      const network = await web3Service.getNetworkInfo();

      // Clear disconnect flag on successful connection
      localStorage.removeItem('walletDisconnected');

      setState({
        account,
        balance,
        chainId: network.chainId,
        isConnected: true,
        isConnecting: false,
      });

      toast.success('Wallet connected successfully');
      return account;
    } catch (error: any) {
      console.error('Connection error:', error);
      setState(prev => ({ ...prev, isConnecting: false }));
      toast.error(error.message || 'Failed to connect wallet');
      throw error;
    }
  }, []);

  const disconnect = useCallback(async () => {
    await web3Service.disconnect();

    // Set flag to prevent auto-reconnect on refresh
    localStorage.setItem('walletDisconnected', 'true');

    setState({
      account: null,
      balance: null,
      chainId: null,
      isConnected: false,
      isConnecting: false,
    });
    toast.info('Wallet disconnected');
  }, []);

  const refreshBalance = useCallback(async () => {
    if (!state.isConnected) return;
    try {
      const balance = await web3Service.getBalance();
      setState(prev => ({ ...prev, balance }));
    } catch (error) {
      console.error('Error refreshing balance:', error);
    }
  }, [state.isConnected]);

  // Listen for account changes
  useEffect(() => {
    if (!window.ethereum) return;

    const handleAccountsChanged = (accounts: string[]) => {
      if (accounts.length === 0) {
        disconnect();
      } else if (accounts[0] !== state.account) {
        connect();
      }
    };

    const handleChainChanged = () => {
      window.location.reload();
    };

    window.ethereum.on('accountsChanged', handleAccountsChanged);
    window.ethereum.on('chainChanged', handleChainChanged);

    return () => {
      window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
      window.ethereum.removeListener('chainChanged', handleChainChanged);
    };
  }, [state.account, connect, disconnect]);

  // Auto-connect if previously connected
  useEffect(() => {
    const autoConnect = async () => {
      // Only auto-connect if wallet was NOT explicitly disconnected
      if (window.ethereum && window.ethereum.selectedAddress && !localStorage.getItem('walletDisconnected')) {
        await connect();
      }
    };
    autoConnect();
  }, [connect]); // Added connect to dependency array

  return {
    ...state,
    connect,
    disconnect,
    refreshBalance,
  };
};

export const useProjects = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProjects = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const allProjects = await web3Service.getAllProjects();
      setProjects(allProjects);
    } catch (err: any) {
      console.error('Error fetching projects:', err);
      setError(err.message);
      toast.error('Failed to load projects');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProjects();
  }, [fetchProjects]);

  const createProject = useCallback(async (projectData: {
    title: string;
    description: string;
    category: string;
    imageURI: string;
    goalAmount: string;
    durationDays: number;
    milestones: Array<{
      title: string;
      description: string;
      amount: string;
    }>;
  }) => {
    try {
      toast.loading('Creating project...');
      
      const tx = await web3Service.createProject(
        projectData.title,
        projectData.description,
        projectData.category,
        projectData.imageURI,
        projectData.goalAmount,
        projectData.durationDays,
        projectData.milestones
      );

      toast.loading('Waiting for confirmation...', { id: 'create-project' });
      await tx.wait();
      
      toast.success('Project created successfully!', { id: 'create-project' });
      await fetchProjects();
      
      return tx;
    } catch (err: any) {
      console.error('Error creating project:', err);
      toast.error(err.message || 'Failed to create project', { id: 'create-project' });
      throw err;
    }
  }, [fetchProjects]);

  return {
    projects,
    loading,
    error,
    fetchProjects,
    createProject,
  };
};

export const useProject = (projectId: number) => {
  const [project, setProject] = useState<Project | null>(null);
  const [milestones, setMilestones] = useState<any[]>([]);
  const [backers, setBackers] = useState<string[]>([]);
  const [contribution, setContribution] = useState<string>('0');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProjectDetails = useCallback(async () => {
    if (!projectId) return;
    
    try {
      setLoading(true);
      setError(null);

      const [projectData, milestonesData, backersData] = await Promise.all([
        web3Service.getProject(projectId),
        web3Service.getProjectMilestones(projectId),
        web3Service.getProjectBackers(projectId),
      ]);

      setProject(projectData);
      setMilestones(milestonesData);
      setBackers(backersData);

      // Fetch user's contribution if connected
      try {
        const userContribution = await web3Service.getContribution(projectId);
        setContribution(userContribution);
      } catch (err) {
        // User not connected or hasn't contributed
        setContribution('0');
      }
    } catch (err: any) {
      console.error('Error fetching project:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [projectId]);

  useEffect(() => {
    fetchProjectDetails();
  }, [fetchProjectDetails]);

  const contribute = useCallback(async (amount: string) => {
    if (!projectId) return;

    try {
      toast.loading('Processing contribution...');
      
      const tx = await web3Service.contribute(projectId, amount);
      
      toast.loading('Waiting for confirmation...', { id: 'contribute' });
      await tx.wait();
      
      toast.success('Contribution successful!', { id: 'contribute' });
      await fetchProjectDetails();
      
      return tx;
    } catch (err: any) {
      console.error('Error contributing:', err);
      toast.error(err.message || 'Failed to contribute', { id: 'contribute' });
      throw err;
    }
  }, [projectId, fetchProjectDetails]);

  const submitMilestone = useCallback(async (milestoneIndex: number, proofURI: string) => {
    if (!projectId) return;

    try {
      toast.loading('Submitting milestone...');
      
      const tx = await web3Service.submitMilestone(projectId, milestoneIndex, proofURI);
      
      toast.loading('Waiting for confirmation...', { id: 'submit-milestone' });
      await tx.wait();
      
      toast.success('Milestone submitted!', { id: 'submit-milestone' });
      await fetchProjectDetails();
      
      return tx;
    } catch (err: any) {
      console.error('Error submitting milestone:', err);
      toast.error(err.message || 'Failed to submit milestone', { id: 'submit-milestone' });
      throw err;
    }
  }, [projectId, fetchProjectDetails]);

  const voteOnMilestone = useCallback(async (milestoneIndex: number, approve: boolean) => {
    if (!projectId) return;

    try {
      toast.loading('Submitting vote...');
      
      const tx = await web3Service.voteOnMilestone(projectId, milestoneIndex, approve);
      
      toast.loading('Waiting for confirmation...', { id: 'vote' });
      await tx.wait();
      
      toast.success('Vote recorded!', { id: 'vote' });
      await fetchProjectDetails();
      
      return tx;
    } catch (err: any) {
      console.error('Error voting:', err);
      toast.error(err.message || 'Failed to vote', { id: 'vote' });
      throw err;
    }
  }, [projectId, fetchProjectDetails]);

  const refund = useCallback(async () => {
    if (!projectId) return;

    try {
      toast.loading('Processing refund...');
      
      const tx = await web3Service.refund(projectId);
      
      toast.loading('Waiting for confirmation...', { id: 'refund' });
      await tx.wait();
      
      toast.success('Refund processed!', { id: 'refund' });
      await fetchProjectDetails();
      
      return tx;
    } catch (err: any) {
      console.error('Error processing refund:', err);
      toast.error(err.message || 'Failed to process refund', { id: 'refund' });
      throw err;
    }
  }, [projectId, fetchProjectDetails]);

  return {
    project,
    milestones,
    backers,
    contribution,
    loading,
    error,
    contribute,
    submitMilestone,
    voteOnMilestone,
    refund,
    refresh: fetchProjectDetails,
  };
};

export const useNFTs = (projectId?: number) => {
  const [nfts, setNfts] = useState<number[]>([]);
  const [balance, setBalance] = useState<number>(0);
  const [loading, setLoading] = useState(true);

  const fetchNFTs = useCallback(async () => {
    try {
      setLoading(true);
      
      const nftBalance = await web3Service.getNFTBalance();
      setBalance(nftBalance);

      if (projectId) {
        const backerNFTs = await web3Service.getBackerNFTs(projectId);
        setNfts(backerNFTs);
      }
    } catch (err) {
      console.error('Error fetching NFTs:', err);
    } finally {
      setLoading(false);
    }
  }, [projectId]);

  useEffect(() => {
    fetchNFTs();
  }, [fetchNFTs]);

  const getNFTMetadata = useCallback(async (tokenId: number) => {
    try {
      return await web3Service.getNFTMetadata(tokenId);
    } catch (err: any) {
      console.error('Error fetching NFT metadata:', err);
      throw err;
    }
  }, []);

  return {
    nfts,
    balance,
    loading,
    getNFTMetadata,
    refresh: fetchNFTs,
  };
};