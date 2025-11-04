import { useMorpho } from "@/hooks/useMorpho";
import { useQuery } from "@tanstack/react-query";

export function useBorrowAPY() {
  const { getBorrowAPY, ready } = useMorpho();

  return useQuery({
    queryKey: ["borrow-apy"],
    queryFn: async () => {
      return await getBorrowAPY();
    },
    enabled: ready,
  });
}
