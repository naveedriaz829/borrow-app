import { useCallback, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

enum IndexStatus {
  NOT_INDEXED = 'NOT_INDEXED',
  INDEXED = 'INDEXED',
  NULL = 'NULL',
}

export const useIndexBorrower = (userAddress: `0x${string}` | null) => {
  const queryClient = useQueryClient();
  const statusRef = useRef<IndexStatus>(IndexStatus.NULL);

  const checkUserStatus = async (address: `0x${string}` | null): Promise<IndexStatus> => {
    console.log('Checking status for:', address);
    const response = await fetch(`/api/verify-item?key=${address}`);
    const data = await response.json();
    const status = data.exists ? IndexStatus.INDEXED : IndexStatus.NOT_INDEXED;
    console.log('Status from API:', status);
    statusRef.current = status;
    return status;
  };

  const writeUser = async (address: `0x${string}` | null): Promise<boolean> => {
    console.log('Writing user:', address);
    const response = await fetch('/api/verify-item', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        key: address,
        value: 'verified',
      }),
    });
    const data = await response.json();
    console.log('Write response:', data);
    return data.success;
  };

  // Query for user status
  const { data: currentStatus, refetch } = useQuery({
    queryKey: ['userIndex', userAddress],
    queryFn: () => checkUserStatus(userAddress),
    enabled: !!userAddress && statusRef.current !== IndexStatus.INDEXED,
    initialData: IndexStatus.NULL,
    staleTime: 0,
    gcTime: Infinity,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
  });

  // Mutation for writing user
  const { mutate: writeUserMutation } = useMutation({
    mutationFn: writeUser,
    onSuccess: async (_, address) => {
      // console.log('Mutation success, updating cache for:', address);
      statusRef.current = IndexStatus.INDEXED;
      await refetch();
      queryClient.setQueryData(['userIndex', address], IndexStatus.INDEXED);
    },
  });

  const writeUserIfNotExists = useCallback(async () => {
    if (!userAddress) return;

    // console.log('writeUserIfNotExists called with status:', currentStatus);

    // If already indexed, return early
    if (currentStatus === IndexStatus.INDEXED) {
      // console.log('User already indexed, returning');
      return;
    }

    // If status is NULL, check if user exists first
    if (currentStatus === IndexStatus.NULL) {
      // console.log('Status is NULL, checking user status');
      const status = await checkUserStatus(userAddress);
      if (status === IndexStatus.INDEXED) {
        // console.log('User found to be indexed, updating cache');
        queryClient.setQueryData(['userIndex', userAddress], IndexStatus.INDEXED);
        return;
      }
    }

    // If we get here, we know the user is NOT_INDEXED
    // console.log('User not indexed, writing to Redis');
    writeUserMutation(userAddress);
  }, [userAddress, currentStatus, writeUserMutation, queryClient, refetch]);

  return {
    currentStatus,
    writeUserIfNotExists,
    refetch,
  };
};