import { Entity, Type } from '@graphprotocol/hypergraph';

/**
 * GRC-20 Schema for POLYVERSE
 * 
 * This defines the knowledge graph entities and relationships for:
 * - Creators (content creators on the platform)
 * - Fans (users who consume creator content)
 * - Content (products, subscriptions, posts)
 * - Relationships (follows, subscribes, purchases)
 */

// Core User Types
export class Creator extends Entity.Class<Creator>('Creator')({
  handle: Type.String,
  name: Type.String,
  bio: Type.String,
  avatar: Type.String,
  banner: Type.String,
  category: Type.String,
  isVerified: Type.Boolean,
  followerCount: Type.Number,
  // Social media links as individual properties
  twitterUrl: Type.optional(Type.String),
  discordUrl: Type.optional(Type.String),
  youtubeUrl: Type.optional(Type.String),
  instagramUrl: Type.optional(Type.String),
  // Timestamps
  createdAt: Type.Date,
  updatedAt: Type.Date,
}) {}

export class Fan extends Entity.Class<Fan>('Fan')({
  walletAddress: Type.String,
  name: Type.String,
  avatar: Type.optional(Type.String),
  joinedAt: Type.Date,
  // Preferences and activity - serialize as comma-separated strings
  preferredCategories: Type.String, // JSON array serialized as string
  totalSpent: Type.Number, // USD value of all purchases
}) {}

// Content Types
export class SubscriptionTier extends Entity.Class<SubscriptionTier>('SubscriptionTier')({
  name: Type.String,
  description: Type.String,
  priceUSD: Type.Number,
  interval: Type.String, // 'monthly' | 'yearly' | 'lifetime'
  features: Type.String, // JSON array serialized as string
  isActive: Type.Boolean,
  createdAt: Type.Date,
  // Relation to Creator
  creator: Type.Relation(Creator),
}) {}

export class Product extends Entity.Class<Product>('Product')({
  title: Type.String,
  description: Type.String,
  priceUSD: Type.Number,
  type: Type.String, // 'course' | 'ebook' | 'digital_art' | 'program' | 'nft'
  imageUrl: Type.optional(Type.String),
  downloadUrl: Type.optional(Type.String),
  isActive: Type.Boolean,
  tags: Type.String, // JSON array serialized as string
  createdAt: Type.Date,
  updatedAt: Type.Date,
  // Relation to Creator
  creator: Type.Relation(Creator),
}) {}

export class Post extends Entity.Class<Post>('Post')({
  title: Type.String,
  content: Type.String,
  type: Type.String, // 'text' | 'image' | 'video' | 'audio'
  mediaUrl: Type.optional(Type.String),
  isPublic: Type.Boolean, // false means subscriber-only
  viewCount: Type.Number,
  likeCount: Type.Number,
  createdAt: Type.Date,
  updatedAt: Type.Date,
  // Relations
  creator: Type.Relation(Creator),
}) {}

// Relationship/Activity Types
export class Follow extends Entity.Class<Follow>('Follow')({
  followedAt: Type.Date,
  isActive: Type.Boolean, // for unfollows
  // Relations
  fan: Type.Relation(Fan),
  creator: Type.Relation(Creator),
}) {}

export class Subscription extends Entity.Class<Subscription>('Subscription')({
  startDate: Type.Date,
  endDate: Type.optional(Type.Date), // null for active subscriptions
  isActive: Type.Boolean,
  paidAmountUSD: Type.Number,
  paymentToken: Type.String, // 'USDC' | 'ETH' | 'MATIC'
  transactionHash: Type.optional(Type.String),
  // Relations
  fan: Type.Relation(Fan),
  tier: Type.Relation(SubscriptionTier),
}) {}

export class Purchase extends Entity.Class<Purchase>('Purchase')({
  purchasedAt: Type.Date,
  amountUSD: Type.Number,
  paymentToken: Type.String,
  tokenAmount: Type.Number,
  transactionHash: Type.String,
  status: Type.String, // 'pending' | 'completed' | 'failed' | 'refunded'
  // Relations
  fan: Type.Relation(Fan),
  product: Type.Relation(Product),
}) {}

export class Like extends Entity.Class<Like>('Like')({
  likedAt: Type.Date,
  isActive: Type.Boolean, // for unlikes
  // Relations
  fan: Type.Relation(Fan),
  post: Type.Relation(Post),
}) {}

export class Review extends Entity.Class<Review>('Review')({
  rating: Type.Number, // 1-5 stars
  comment: Type.optional(Type.String),
  createdAt: Type.Date,
  updatedAt: Type.Date,
  isVerified: Type.Boolean, // true if reviewer actually purchased
  // Relations
  fan: Type.Relation(Fan),
  product: Type.Relation(Product),
  creator: Type.Relation(Creator), 
}) {}

// Platform Analytics Types
export class CreatorStats extends Entity.Class<CreatorStats>('CreatorStats')({
  date: Type.Date, // daily stats
  newFollowers: Type.Number,
  newSubscribers: Type.Number,
  totalRevenue: Type.Number,
  viewCount: Type.Number,
  engagementRate: Type.Number,
  // Relations
  creator: Type.Relation(Creator),
}) {}

export class PlatformMetrics extends Entity.Class<PlatformMetrics>('PlatformMetrics')({
  date: Type.Date,
  totalCreators: Type.Number,
  totalFans: Type.Number,
  dailyActiveUsers: Type.Number,
  totalVolume: Type.Number, // USD value of all transactions
  transactionCount: Type.Number,
}) {}

// Discovery and Recommendation Types
export class Tag extends Entity.Class<Tag>('Tag')({
  name: Type.String,
  category: Type.String,
  usageCount: Type.Number,
  createdAt: Type.Date,
}) {}

export class Category extends Entity.Class<Category>('Category')({
  name: Type.String,
  description: Type.String,
  iconUrl: Type.optional(Type.String),
  creatorCount: Type.Number,
  isActive: Type.Boolean,
}) {}

// Export all entity types for easy importing
export const POLYVERSE_ENTITIES = {
  Creator,
  Fan,
  SubscriptionTier,
  Product,
  Post,
  Follow,
  Subscription,
  Purchase,
  Like,
  Review,
  CreatorStats,
  PlatformMetrics,
  Tag,
  Category,
} as const;

// Type definitions for easier use
export type PolyverseEntity = keyof typeof POLYVERSE_ENTITIES;
export type PolyverseEntityClass<T extends PolyverseEntity> = typeof POLYVERSE_ENTITIES[T];