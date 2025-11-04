import { useMorpho } from "@/hooks/useMorpho";
import { useQuery } from "@tanstack/react-query";

export function useWLDPrice() {
  const { getWLDPrice, ready } = useMorpho();

  return useQuery({
    queryKey: ["wld-price"],
    queryFn: async () => {
      return await getWLDPrice();
    },
    enabled: ready,
  });
}
