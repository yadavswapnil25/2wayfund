/** Copy for the Clients page, sourced from "Our Clients.pdf". */

export const CLIENTS_INTRO =
  "At 2 Way Fund International, we work with businesses operating across different industries and international markets. Our client network represents organizations involved in technology, e-commerce, telecommunications, aviation, retail, food services, cloud computing, and enterprise software.";

export interface Client {
  name: string;
  industry: string;
  description: string;
  /** Path under public/ — supplied by the task owner, sourced from each
   * company's own official brand/press-kit assets. */
  logo: string;
}

export const CLIENTS: Client[] = [
  { name: "Sky Broadband", industry: "Telecommunications & Broadband", description: "A UK-based broadband and telecommunications brand providing connectivity and digital communication services.", logo: "/Sky_Broadband.png" },
  { name: "Flipkart", industry: "E-Commerce & Digital Commerce", description: "A leading Indian digital-commerce platform connecting consumers and sellers through online commerce.", logo: "/Flipkart.jpg" },
  { name: "Alibaba Group", industry: "Technology & E-Commerce", description: "A global technology group with businesses spanning commerce, cloud computing, digital services, and technology.", logo: "/Alibaba.jpg" },
  { name: "Pizza Hut", industry: "Food Service & Restaurant", description: "An internationally recognized restaurant and food-service brand operating across multiple markets.", logo: "/Pizza_Hut.jpg" },
  { name: "Microsoft", industry: "Technology & Software", description: "A global technology company providing software, cloud computing, enterprise solutions, and digital services.", logo: "/Microsoft.jpg" },
  { name: "Air India", industry: "Aviation & Airline Services", description: "An Indian airline serving domestic and international destinations.", logo: "/Air_India.jpg" },
  { name: "IndiGo", industry: "Aviation & Airline Services", description: "A major Indian airline operating domestic and international passenger services.", logo: "/IndiGo-Logo.jpg" },
  { name: "Reliance", industry: "Diversified Business Group", description: "A major Indian business group with activities spanning multiple sectors, including energy, retail, telecommunications, and digital services.", logo: "/Reliance-Industries-Limited-RIL-Logo-1966.png" },
  { name: "Wix", industry: "Web Technology & Digital Business", description: "A global digital platform providing tools for businesses, creators, and organizations to establish their online presence.", logo: "/Wix.png" },
  { name: "Lenskart", industry: "Eyewear, Retail & Technology", description: "A technology-driven eyewear business combining digital commerce with physical retail operations.", logo: "/Lenskart.jpg" },
  { name: "Odoo", industry: "Enterprise Software", description: "A business-software provider offering integrated applications for CRM, accounting, e-commerce, inventory, projects, and other business functions.", logo: "/Odoo_Official_Logo.png" },
  { name: "Meta", industry: "Technology & Digital Platforms", description: "A global technology company operating digital platforms and technologies used by individuals and businesses worldwide.", logo: "/Meta.png" },
  { name: "Amazon Web Services (AWS)", industry: "Cloud Computing & Technology", description: "A global cloud-computing provider offering infrastructure, computing, storage, databases, security, analytics, and other cloud services.", logo: "/AWS.png" },
  { name: "Meesho", industry: "E-Commerce & Digital Commerce", description: "An Indian digital-commerce platform connecting consumers and sellers through its online marketplace ecosystem.", logo: "/Meesho_logo.png" },
];

export interface IndustryGroup {
  label: string;
  members: string[];
}

export const INDUSTRY_GROUPS: IndustryGroup[] = [
  { label: "Technology", members: ["Microsoft", "Meta", "Amazon Web Services (AWS)", "Wix", "Odoo"] },
  { label: "E-Commerce", members: ["Flipkart", "Alibaba Group", "Meesho", "Lenskart"] },
  { label: "Aviation", members: ["Air India", "IndiGo"] },
  { label: "Telecommunications", members: ["Sky Broadband"] },
  { label: "Food & Restaurant", members: ["Pizza Hut"] },
  { label: "Diversified Business", members: ["Reliance"] },
];

export const CONNECTING_STATEMENT =
  "At 2 Way Fund International, our objective is to provide eligible businesses and customers with a structured environment for international payment processing, currency conversion, and cross-border financial transactions.";
