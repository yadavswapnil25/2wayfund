/** Copy for the Clients page. Every organisation named here is invented for
 * this prototype — see the on-page disclaimer. Naming a real company as a
 * client of a financial institution (fictional or not) would assert a
 * business relationship that doesn't exist, so none of the source material's
 * real-world brand names are used; the industries and one-line descriptions
 * are adapted, with invented names standing in for them. */

export const CLIENTS_INTRO =
  "At 2 Way Fund International, we work with businesses operating across different industries and international markets. Our client network represents organizations involved in technology, e-commerce, telecommunications, aviation, retail, food services, cloud computing, and enterprise software.";

export interface Client {
  name: string;
  industry: string;
  description: string;
}

export const CLIENTS: Client[] = [
  { name: "Loopwave Communications", industry: "Telecommunications & Broadband", description: "A broadband and telecommunications brand providing connectivity and digital communication services." },
  { name: "Marketa Group", industry: "E-Commerce & Digital Commerce", description: "A fast-growing digital-commerce platform connecting consumers and sellers through online commerce." },
  { name: "Panorama Holdings", industry: "Technology & E-Commerce", description: "A global technology group with businesses spanning commerce, cloud computing, digital services, and technology." },
  { name: "Slice & Vine", industry: "Food Service & Restaurant", description: "An internationally recognized restaurant and food-service brand operating across multiple markets." },
  { name: "Northmark Software", industry: "Technology & Software", description: "A global technology company providing software, cloud computing, enterprise solutions, and digital services." },
  { name: "Vantara Airways Pvt Ltd", industry: "Aviation & Airline Services", description: "An airline serving domestic and international destinations." },
  { name: "BlueWing Airlines", industry: "Aviation & Airline Services", description: "A major airline operating domestic and international passenger services." },
  { name: "Ironmoor Industries", industry: "Diversified Business Group", description: "A major diversified business group with activities spanning multiple sectors, including energy, retail, telecommunications, and digital services." },
  { name: "SitePeak Digital", industry: "Web Technology & Digital Business", description: "A global digital platform providing tools for businesses, creators, and organizations to establish their online presence." },
  { name: "ClearView Optics", industry: "Eyewear, Retail & Technology", description: "A technology-driven eyewear business combining digital commerce with physical retail operations." },
  { name: "Corestack Software", industry: "Enterprise Software", description: "A business-software provider offering integrated applications for CRM, accounting, e-commerce, inventory, projects, and other business functions." },
  { name: "Verrelink Technologies", industry: "Technology & Digital Platforms", description: "A global technology company operating digital platforms and technologies used by individuals and businesses worldwide." },
  { name: "Corvid Cloud SAS", industry: "Cloud Computing & Technology", description: "A global cloud-computing provider offering infrastructure, computing, storage, databases, security, analytics, and other cloud services." },
  { name: "Bazaarlane", industry: "E-Commerce & Digital Commerce", description: "A digital-commerce platform connecting consumers and sellers through its online marketplace ecosystem." },
];

export interface IndustryGroup {
  label: string;
  members: string[];
}

export const INDUSTRY_GROUPS: IndustryGroup[] = [
  { label: "Technology", members: ["Northmark Software", "Verrelink Technologies", "Corvid Cloud SAS", "SitePeak Digital", "Corestack Software"] },
  { label: "E-Commerce", members: ["Marketa Group", "Panorama Holdings", "Bazaarlane", "ClearView Optics"] },
  { label: "Aviation", members: ["Vantara Airways Pvt Ltd", "BlueWing Airlines"] },
  { label: "Telecommunications", members: ["Loopwave Communications"] },
  { label: "Food & Restaurant", members: ["Slice & Vine"] },
  { label: "Diversified Business", members: ["Ironmoor Industries"] },
];

export const CONNECTING_STATEMENT =
  "At 2 Way Fund International, our objective is to provide eligible businesses and customers with a structured environment for international payment processing, currency conversion, and cross-border financial transactions.";
