export enum ItemCategory {
  ELECTRONICS = 'ELECTRONICS',
  JEWELRY = 'JEWELRY',
  COLLECTIBLES = 'COLLECTIBLES',
  ART = 'ART',
  FASHION = 'FASHION',
  HOME_AND_GARDEN = 'HOME_AND_GARDEN',
  SPORTS = 'SPORTS',
  VEHICLES = 'VEHICLES',
  REAL_ESTATE = 'REAL_ESTATE',
  OTHER = 'OTHER',
}

export enum ItemCondition {
  NEW = 'NEW',
  LIKE_NEW = 'LIKE_NEW',
  VERY_GOOD = 'VERY_GOOD',
  GOOD = 'GOOD',
  ACCEPTABLE = 'ACCEPTABLE',
  FOR_PARTS_OR_NOT_WORKING = 'FOR_PARTS_OR_NOT_WORKING',
}

export enum ItemStatus {
  DRAFT = 'DRAFT',
  READY = 'READY',
  AUCTIONING = 'AUCTIONING',
  SOLD = 'SOLD',
  CANCELLED = 'CANCELLED',
}

export enum AuctionStatus {
  SCHEDULED = 'SCHEDULED',
  ACTIVE = 'ACTIVE',
  ENDED = 'ENDED',
  CANCELLED = 'CANCELLED',
}

export enum BidStatus {
  PENDING = 'PENDING',
  ACCEPTED = 'ACCEPTED',
  REJECTED = 'REJECTED',
  CANCELLED = 'CANCELLED',
}

export enum MediaType {
  IMAGE = 'IMAGE',
  VIDEO = 'VIDEO',
}

export interface Customer {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  username: string;
}

// ── Auth ──────────────────────────────────────────────────────────────────────

export interface RegisterDto {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  username: string;
  password: string;
}

export interface LoginDto {
  email: string;
  password: string;
}

export interface AuthResponse {
  token: string;
  customerId: number;
  username: string;
  email: string;
}

// ── Account / Wallet ──────────────────────────────────────────────────────────

export enum TransactionType {
  DEPOSIT = 'DEPOSIT',
  WITHDRAWAL = 'WITHDRAWAL',
  BID_HOLD = 'BID_HOLD',
  BID_RELEASE = 'BID_RELEASE',
  BID_CHARGE = 'BID_CHARGE',
}

export enum PaymentMethod {
  VISA = 'VISA',
  MASTERCARD = 'MASTERCARD',
  GOOGLE_PAY = 'GOOGLE_PAY',
  APPLE_PAY = 'APPLE_PAY',
}

export interface Transaction {
  id: number;
  type: TransactionType;
  amount: number;
  description: string;
  paymentMethod?: PaymentMethod;
  createdAt: string;
}

export interface BidHistoryEntry {
  bidId: number;
  auctionId: number;
  itemName: string;
  amount: number;
  status: BidStatus;
  placedAt: string;
}

export interface Account {
  id: number;
  customerId: number;
  balance: number;
  heldAmount: number;
  availableBalance: number;
  transactions: Transaction[];
  bidHistory: BidHistoryEntry[];
}

export interface AddFundsDto {
  amount: number;
  paymentMethod: PaymentMethod;
  cardNumber?: string;
  cardHolderName?: string;
  expiryDate?: string;
  cvv?: string;
}

export interface MediaLink {
  id: number;
  mediaType: MediaType;
  url: string;
}

export interface Item {
  id: number;
  title: string;
  category: ItemCategory;
  condition: ItemCondition;
  status: ItemStatus;
  ownerId: number;
  description: string;
  mediaLinks: MediaLink[];
}

export interface Auction {
  id: number;
  itemId: number;
  startPrice: number;
  startTime: string;
  endTime: string;
  minBidIncrement: number;
  reservePrice: number;
  buyOutPrice: number;
  status: AuctionStatus;
}

export interface Bid {
  id: number;
  itemName: string;
  amount: number;
  customerId: number;
  status: BidStatus;
}

export interface CreateCustomerDto {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  username: string;
}

export interface CreateItemDto {
  title: string;
  category: ItemCategory;
  condition: ItemCondition;
  ownerId: number;
  description: string;
  mediaLinks: MediaLink[];
}

export interface CreateAuctionDto {
  itemId: number;
  startPrice: number;
  startTime: string;
  endTime: string;
  minBidIncrement: number;
  reservePrice: number;
  buyOutPrice: number;
}

export interface CreateBidDto {
  itemName: string;
  amount: number;
  customerId: number;
}

export interface AddMediaDto {
  mediaType: MediaType;
  url: string;
}
