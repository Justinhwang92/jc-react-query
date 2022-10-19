import { AxiosResponse } from 'axios';
import { useQuery, useQueryClient } from 'react-query';

import type { User } from '../../../../../shared/types';
import { axiosInstance, getJWTHeader } from '../../../axiosInstance';
import { queryKeys } from '../../../react-query/constants';
import {
  clearStoredUser,
  getStoredUser,
  setStoredUser,
} from '../../../user-storage';

async function getUser(user: User | null): Promise<User | null> {
  if (!user) return null;
  const { data }: AxiosResponse<{ user: User }> = await axiosInstance.get(
    `/user/${user.id}`,
    {
      headers: getJWTHeader(user),
    },
  );
  return data.user;
}

interface UseUser {
  user: User | null;
  updateUser: (user: User) => void;
  clearUser: () => void;
}

export function useUser(): UseUser {
  // update user data from server
  const queryClient = useQueryClient();
  const { data: user } = useQuery(queryKeys.user, () => getUser(user), {
    initialData: getStoredUser,
    // store user data in the local storage on Success
    onSuccess: (received: User | null) => {
      if (!received) {
        clearStoredUser();
      } else {
        setStoredUser(received);
      }
    },
  });

  // meant to be called from useAuth
  function updateUser(newUser: User): void {
    // update the user in the query cache
    queryClient.setQueryData(queryKeys.user, newUser);
    queryClient.removeQueries('user-appointments'); // remove the user data from the query cache
  }

  // meant to be called from useAuth
  function clearUser() {
    // reset user to null in query cache
    queryClient.setQueryData(queryKeys.user, null);
  }

  return { user, updateUser, clearUser };
}
