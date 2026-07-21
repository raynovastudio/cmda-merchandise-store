export type Conference = {
  id: string;
  name: string;
  location: string;
  date: string;
  endDate: string;
  pickupEnabled: boolean;
};

export const conferences: Conference[] = [
  {
    id: "national-2026",
    name: "CMDA National Conference 2026",
    location: "University of Jos, Plateau State",
    date: "2026-08-15",
    endDate: "2026-08-20",
    pickupEnabled: true,
  },
  {
    id: "regional-south-2026",
    name: "Southern Regional Conference 2026",
    location: "University of Benin, Edo State",
    date: "2026-09-10",
    endDate: "2026-09-12",
    pickupEnabled: true,
  },
  {
    id: "regional-north-2026",
    name: "Northern Regional Conference 2026",
    location: "Ahmadu Bello University, Kaduna",
    date: "2026-09-24",
    endDate: "2026-09-26",
    pickupEnabled: true,
  },
  {
    id: "global-network-2026",
    name: "CMDA Global Network Meeting 2026",
    location: "Lagos Continental Hotel, Lagos",
    date: "2026-11-05",
    endDate: "2026-11-07",
    pickupEnabled: true,
  },
];

export const nigerianStates = [
  "Abia", "Adamawa", "Akwa Ibom", "Anambra", "Bauchi", "Bayelsa",
  "Benue", "Borno", "Cross River", "Delta", "Ebonyi", "Edo", "Ekiti",
  "Enugu", "FCT Abuja", "Gombe", "Imo", "Jigawa", "Kaduna", "Kano",
  "Katsina", "Kebbi", "Kogi", "Kwara", "Lagos", "Nasarawa", "Niger",
  "Ogun", "Ondo", "Osun", "Oyo", "Plateau", "Rivers", "Sokoto",
  "Taraba", "Yobe", "Zamfara",
];
