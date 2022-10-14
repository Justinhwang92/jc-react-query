import { useQuery } from 'react-query';

import type { Treatment } from '../../../../../shared/types';
import { axiosInstance } from '../../../axiosInstance';
import { queryKeys } from '../../../react-query/constants';
// import { useCustomToast } from '../../app/hooks/useCustomToast';

// for when we need a query function for useQuery
async function getTreatments(): Promise<Treatment[]> {
  const { data } = await axiosInstance.get('/treatments');
  return data;
}

export function useTreatments(): Treatment[] {
  // const toast = useCustomToast(); // custom toast hook
  const fallback = []; // for when we don't have data yet

  // get data from server via useQuery
  // Error handling with Passing errors to toasts
  // const { data = fallback } = useQuery(queryKeys.treatments, getTreatments, {
  //   onError: (error) => {
  //     const title =
  //       error instanceof Error ? error.message : 'Error connecting to server';
  //     toast({ title, status: 'error' }); // show toast on error
  //   },
  // });

  // get data from server via useQuery
  const { data = fallback } = useQuery(queryKeys.treatments, getTreatments);
  return data;
}
