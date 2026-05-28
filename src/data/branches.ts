export interface Branch {
  id: string;
  name: string;
  code: string;
  city: string;
  address: string;
  status: "active" | "maintenance";
}

export const mockBranches: Branch[] = [
  {
    id: "branch-pusat",
    name: "Seven Gym Pusat",
    code: "PST",
    city: "Jakarta Selatan",
    address: "Jl. Wijaya Fitness No. 7",
    status: "active",
  },
  {
    id: "branch-bsd",
    name: "Seven Gym BSD",
    code: "BSD",
    city: "Tangerang Selatan",
    address: "Ruko Fit District Blok A7",
    status: "active",
  },
  {
    id: "branch-bekasi",
    name: "Seven Gym Bekasi",
    code: "BKS",
    city: "Bekasi",
    address: "Jl. Galaxy Raya No. 17",
    status: "active",
  },
  {
    id: "branch-depok",
    name: "Seven Gym Depok",
    code: "DPK",
    city: "Depok",
    address: "Jl. Margonda Raya No. 77",
    status: "maintenance",
  },
];

export const allBranchIds = mockBranches.map((branch) => branch.id);

export const getBranchById = (branchId: string) =>
  mockBranches.find((branch) => branch.id === branchId) ?? mockBranches[0];
