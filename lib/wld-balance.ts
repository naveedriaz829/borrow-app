const fetchWLDBalance = async (userAddress: string) => {
  const response = await fetch("/api/wld-balance");
  const data = await response.json();
  return data;
};
