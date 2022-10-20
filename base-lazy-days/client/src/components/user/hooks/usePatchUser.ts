import jsonpatch from 'fast-json-patch';
import { UseMutateFunction, useMutation, useQueryClient } from 'react-query';

import type { User } from '../../../../../shared/types';
import { axiosInstance, getJWTHeader } from '../../../axiosInstance';
import { queryKeys } from '../../../react-query/constants';
import { useCustomToast } from '../../app/hooks/useCustomToast';
import { useUser } from './useUser';

// for when we need a server function
async function patchUserOnServer(
  newData: User | null,
  originalData: User | null,
): Promise<User | null> {
  if (!newData || !originalData) return null;
  // create a patch for the difference between newData and originalData
  const patch = jsonpatch.compare(originalData, newData);

  // send patched data to the server
  const { data } = await axiosInstance.patch(
    `/user/${originalData.id}`,
    { patch },
    {
      headers: getJWTHeader(originalData),
    },
  );
  return data.user;
}

export function usePatchUser(): UseMutateFunction<
  User,
  unknown,
  User,
  unknown
> {
  const { user, updateUser } = useUser();
  const toast = useCustomToast();
  const queryClient = useQueryClient();

  const { mutate: patchUser } = useMutation(
    (newUserData: User) => patchUserOnServer(newUserData, user),
    {
      onMutate: async (newUserData: User | null) => {
        // cancel any outgoing refetches (so they don't overwrite our optimistic update)
        await queryClient.cancelQueries(queryKeys.user);

        // snapshot the previous value
        const previousUser: User = queryClient.getQueryData(queryKeys.user);

        // optimistically update to the new value
        if (newUserData) {
          queryClient.setQueryData(queryKeys.user, newUserData);
        }

        // return a context object with the snapshotted value
        return { previousUser };
      },
      // If the mutation fails, use the context returned from onMutate to roll back
      onError: (err, newUserData, context) => {
        if (context?.previousUser) {
          updateUser(context.previousUser);
          toast({
            title: 'Update failed; restoring previous values',
            status: 'warning',
          });
        }
      },
      onSuccess: (userData: User | null) => {
        if (userData) {
          toast({
            title: 'User updated',
            status: 'success',
          });
        }
      },
      // Always refetch after error or success:
      onSettled: () => {
        queryClient.invalidateQueries(queryKeys.user);
      },
    },
  );

  return patchUser;
}
