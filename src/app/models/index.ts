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
  ACTIVE = 'ACTIVE',
  OUTBID = 'OUTBID',
}

export enum PaymentMethod {
  VISA = 'VISA',
  MASTERCARD = 'MASTERCARD',
  GOOGLE_PAY = 'GOOGLE_PAY',
  APPLE_PAY = 'APPLE_PAY',
  INTERNAL = 'INTERNAL',
}

export enum TransactionStatus {
  PENDING = 'PENDING',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED',
  REVERSED = 'REVERSED',
}

export enum TransactionType {
  DEPOSIT = 'DEPOSIT',
  WITHDRAWAL = 'WITHDRAWAL',
  BID_HOLD = 'BID_HOLD',
  BID_RELEASE = 'BID_RELEASE',
  PAYMENT = 'PAYMENT',
}

export enum MediaType {
  IMAGE = 'IMAGE',
  VIDEO = 'VIDEO',
}

export interface Customer {
  id: number;
  username: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
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
  itemTitle: string;
  startPrice: number;
  startTime: string;
  endTime: string;
  minBidIncrement: number;
  reservePrice: number;
  buyOutPrice: number;
  status: AuctionStatus;
  createdAt?: string;
  updatedAt?: string;
}

export interface Bid {
  id: number;
  itemName: string;
  amount: number;
  customerId: number;
  customerEmail?: string;
  auctionId?: number;
  status: BidStatus;
  createdAt?: string;
  updatedAt?: string;
}

export interface Account {
  id: number;
  customerId: number;
  username: string;
  balance: number;
  heldAmount: number;
  availableBalance: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface Transaction {
  id: number;
  amount: number;
  type: TransactionType;
  paymentMethod: PaymentMethod;
  status: TransactionStatus;
  referenceId?: string;
  description?: string;
  createdAt?: string;
}

export interface DepositRequestDto {
  amount: number;
  paymentMethod: PaymentMethod;
}

export interface CreateCustomerDto {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
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
  auctionId: number;
}

export interface AddMediaDto {
  mediaType: MediaType;
  url: string;
}

export interface RegisterDto {
  username: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  password: string;
}

export interface LoginDto {
  username: string;
  password: string;
}

export interface AuthResponse {
  token: string;
  customer: Customer;
}
