import type { Mapping } from '@graphprotocol/hypergraph';
import { Id } from '@graphprotocol/hypergraph';

/**
 * GRC-20 Mapping for POLYVERSE
 * 
 * This maps POLYVERSE entities to their corresponding GRC-20 IDs in the knowledge graph.
 * Each entity type and property gets a unique GRC-20 identifier for global composability.
 */

export const mapping: Mapping.Mapping = {
  Creator: {
    typeIds: [Id('550e8400-e29b-41d4-a716-446655440001')],
    properties: {
      handle: Id('550e8400-e29b-41d4-a716-446655440002'),
      name: Id('550e8400-e29b-41d4-a716-446655440003'),
      bio: Id('550e8400-e29b-41d4-a716-446655440004'),
      avatar: Id('550e8400-e29b-41d4-a716-446655440005'),
      banner: Id('550e8400-e29b-41d4-a716-446655440006'),
      category: Id('550e8400-e29b-41d4-a716-446655440007'),
      isVerified: Id('550e8400-e29b-41d4-a716-446655440008'),
      followerCount: Id('550e8400-e29b-41d4-a716-446655440009'),
      twitterUrl: Id('550e8400-e29b-41d4-a716-44665544000a'),
      discordUrl: Id('550e8400-e29b-41d4-a716-44665544000b'),
      youtubeUrl: Id('550e8400-e29b-41d4-a716-44665544000c'),
      instagramUrl: Id('550e8400-e29b-41d4-a716-44665544000d'),
      createdAt: Id('550e8400-e29b-41d4-a716-44665544000e'),
      updatedAt: Id('550e8400-e29b-41d4-a716-44665544000f'),
    },
    relations: {
      subscriptionTiers: Id('550e8400-e29b-41d4-a716-446655440020'),
      products: Id('550e8400-e29b-41d4-a716-446655440021'),
      posts: Id('550e8400-e29b-41d4-a716-446655440022'),
      followers: Id('550e8400-e29b-41d4-a716-446655440023'),
      stats: Id('550e8400-e29b-41d4-a716-446655440024'),
    },
  },

  Fan: {
    typeIds: [Id('550e8400-e29b-41d4-a716-446655440030')],
    properties: {
      walletAddress: Id('550e8400-e29b-41d4-a716-446655440031'),
      name: Id('550e8400-e29b-41d4-a716-446655440032'),
      avatar: Id('550e8400-e29b-41d4-a716-446655440033'),
      joinedAt: Id('550e8400-e29b-41d4-a716-446655440034'),
      preferredCategories: Id('550e8400-e29b-41d4-a716-446655440035'),
      totalSpent: Id('550e8400-e29b-41d4-a716-446655440036'),
    },
    relations: {
      follows: Id('550e8400-e29b-41d4-a716-446655440037'),
      subscriptions: Id('550e8400-e29b-41d4-a716-446655440038'),
      purchases: Id('550e8400-e29b-41d4-a716-446655440039'),
      likes: Id('550e8400-e29b-41d4-a716-44665544003a'),
      reviews: Id('550e8400-e29b-41d4-a716-44665544003b'),
    },
  },

  SubscriptionTier: {
    typeIds: [Id('550e8400-e29b-41d4-a716-446655440050')],
    properties: {
      name: Id('550e8400-e29b-41d4-a716-446655440051'),
      description: Id('550e8400-e29b-41d4-a716-446655440052'),
      priceUSD: Id('550e8400-e29b-41d4-a716-446655440053'),
      interval: Id('550e8400-e29b-41d4-a716-446655440054'),
      features: Id('550e8400-e29b-41d4-a716-446655440055'),
      isActive: Id('550e8400-e29b-41d4-a716-446655440056'),
      createdAt: Id('550e8400-e29b-41d4-a716-446655440057'),
    },
    relations: {
      creator: Id('550e8400-e29b-41d4-a716-446655440058'),
    },
  },

  Product: {
    typeIds: [Id('550e8400-e29b-41d4-a716-446655440070')],
    properties: {
      title: Id('550e8400-e29b-41d4-a716-446655440071'),
      description: Id('550e8400-e29b-41d4-a716-446655440072'),
      priceUSD: Id('550e8400-e29b-41d4-a716-446655440073'),
      type: Id('550e8400-e29b-41d4-a716-446655440074'),
      imageUrl: Id('550e8400-e29b-41d4-a716-446655440075'),
      downloadUrl: Id('550e8400-e29b-41d4-a716-446655440076'),
      isActive: Id('550e8400-e29b-41d4-a716-446655440077'),
      tags: Id('550e8400-e29b-41d4-a716-446655440078'),
      createdAt: Id('550e8400-e29b-41d4-a716-446655440079'),
      updatedAt: Id('550e8400-e29b-41d4-a716-44665544007a'),
    },
    relations: {
      creator: Id('550e8400-e29b-41d4-a716-44665544007b'),
    },
  },

  Post: {
    typeIds: [Id('550e8400-e29b-41d4-a716-446655440090')],
    properties: {
      title: Id('550e8400-e29b-41d4-a716-446655440091'),
      content: Id('550e8400-e29b-41d4-a716-446655440092'),
      type: Id('550e8400-e29b-41d4-a716-446655440093'),
      mediaUrl: Id('550e8400-e29b-41d4-a716-446655440094'),
      isPublic: Id('550e8400-e29b-41d4-a716-446655440095'),
      likeCount: Id('550e8400-e29b-41d4-a716-446655440096'),
      commentCount: Id('550e8400-e29b-41d4-a716-446655440097'),
      tags: Id('550e8400-e29b-41d4-a716-446655440098'),
      createdAt: Id('550e8400-e29b-41d4-a716-446655440099'),
      updatedAt: Id('550e8400-e29b-41d4-a716-44665544009a'),
    },
    relations: {
      creator: Id('550e8400-e29b-41d4-a716-44665544009b'),
      likes: Id('550e8400-e29b-41d4-a716-44665544009c'),
    },
  },

  Follow: {
    typeIds: [Id('550e8400-e29b-41d4-a716-4466554400b0')],
    properties: {
      followedAt: Id('550e8400-e29b-41d4-a716-4466554400b1'),
      isActive: Id('550e8400-e29b-41d4-a716-4466554400b2'),
    },
    relations: {
      fan: Id('550e8400-e29b-41d4-a716-4466554400b3'),
      creator: Id('550e8400-e29b-41d4-a716-4466554400b4'),
    },
  },

  Subscription: {
    typeIds: [Id('550e8400-e29b-41d4-a716-4466554400d0')],
    properties: {
      startDate: Id('550e8400-e29b-41d4-a716-4466554400d1'),
      endDate: Id('550e8400-e29b-41d4-a716-4466554400d2'),
      isActive: Id('550e8400-e29b-41d4-a716-4466554400d3'),
      amountPaidUSD: Id('550e8400-e29b-41d4-a716-4466554400d4'),
      paymentToken: Id('550e8400-e29b-41d4-a716-4466554400d5'),
      tokenAmount: Id('550e8400-e29b-41d4-a716-4466554400d6'),
      transactionHash: Id('550e8400-e29b-41d4-a716-4466554400d7'),
    },
    relations: {
      fan: Id('550e8400-e29b-41d4-a716-4466554400d8'),
      subscriptionTier: Id('550e8400-e29b-41d4-a716-4466554400d9'),
    },
  },

  Purchase: {
    typeIds: [Id('550e8400-e29b-41d4-a716-4466554400f0')],
    properties: {
      purchasedAt: Id('550e8400-e29b-41d4-a716-4466554400f1'),
      amountUSD: Id('550e8400-e29b-41d4-a716-4466554400f2'),
      paymentToken: Id('550e8400-e29b-41d4-a716-4466554400f3'),
      tokenAmount: Id('550e8400-e29b-41d4-a716-4466554400f4'),
      transactionHash: Id('550e8400-e29b-41d4-a716-4466554400f5'),
      status: Id('550e8400-e29b-41d4-a716-4466554400f6'),
    },
    relations: {
      fan: Id('550e8400-e29b-41d4-a716-4466554400f7'),
      product: Id('550e8400-e29b-41d4-a716-4466554400f8'),
    },
  },

  Like: {
    typeIds: [Id('550e8400-e29b-41d4-a716-446655440110')],
    properties: {
      likedAt: Id('550e8400-e29b-41d4-a716-446655440111'),
      isActive: Id('550e8400-e29b-41d4-a716-446655440112'),
    },
    relations: {
      fan: Id('550e8400-e29b-41d4-a716-446655440113'),
      post: Id('550e8400-e29b-41d4-a716-446655440114'),
    },
  },

  Review: {
    typeIds: [Id('550e8400-e29b-41d4-a716-446655440130')],
    properties: {
      rating: Id('550e8400-e29b-41d4-a716-446655440131'),
      comment: Id('550e8400-e29b-41d4-a716-446655440132'),
      reviewedAt: Id('550e8400-e29b-41d4-a716-446655440133'),
      isVerifiedPurchase: Id('550e8400-e29b-41d4-a716-446655440134'),
    },
    relations: {
      fan: Id('550e8400-e29b-41d4-a716-446655440135'),
      product: Id('550e8400-e29b-41d4-a716-446655440136'),
      creator: Id('550e8400-e29b-41d4-a716-446655440137'),
    },
  },

  CreatorStats: {
    typeIds: [Id('550e8400-e29b-41d4-a716-446655440150')],
    properties: {
      totalRevenue: Id('550e8400-e29b-41d4-a716-446655440151'),
      totalFollowers: Id('550e8400-e29b-41d4-a716-446655440152'),
      totalSubscribers: Id('550e8400-e29b-41d4-a716-446655440153'),
      totalProducts: Id('550e8400-e29b-41d4-a716-446655440154'),
      totalPosts: Id('550e8400-e29b-41d4-a716-446655440155'),
      averageRating: Id('550e8400-e29b-41d4-a716-446655440156'),
      monthlyActiveUsers: Id('550e8400-e29b-41d4-a716-446655440157'),
      updatedAt: Id('550e8400-e29b-41d4-a716-446655440158'),
    },
    relations: {
      creator: Id('550e8400-e29b-41d4-a716-446655440159'),
    },
  },

  PlatformMetrics: {
    typeIds: [Id('550e8400-e29b-41d4-a716-446655440170')],
    properties: {
      totalUsers: Id('550e8400-e29b-41d4-a716-446655440171'),
      totalCreators: Id('550e8400-e29b-41d4-a716-446655440172'),
      totalRevenue: Id('550e8400-e29b-41d4-a716-446655440173'),
      totalTransactions: Id('550e8400-e29b-41d4-a716-446655440174'),
      activeUsersDaily: Id('550e8400-e29b-41d4-a716-446655440175'),
      activeUsersMonthly: Id('550e8400-e29b-41d4-a716-446655440176'),
      recordedAt: Id('550e8400-e29b-41d4-a716-446655440177'),
    },
  },

  Tag: {
    typeIds: [Id('550e8400-e29b-41d4-a716-446655440190')],
    properties: {
      name: Id('550e8400-e29b-41d4-a716-446655440191'),
      description: Id('550e8400-e29b-41d4-a716-446655440192'),
      color: Id('550e8400-e29b-41d4-a716-446655440193'),
      usageCount: Id('550e8400-e29b-41d4-a716-446655440194'),
      createdAt: Id('550e8400-e29b-41d4-a716-446655440195'),
    },
  },

  Category: {
    typeIds: [Id('550e8400-e29b-41d4-a716-4466554401b0')],
    properties: {
      name: Id('550e8400-e29b-41d4-a716-4466554401b1'),
      description: Id('550e8400-e29b-41d4-a716-4466554401b2'),
      slug: Id('550e8400-e29b-41d4-a716-4466554401b3'),
      icon: Id('550e8400-e29b-41d4-a716-4466554401b4'),
      isActive: Id('550e8400-e29b-41d4-a716-4466554401b5'),
      sortOrder: Id('550e8400-e29b-41d4-a716-4466554401b6'),
    },
    relations: {
      parent: Id('550e8400-e29b-41d4-a716-4466554401b7'),
      children: Id('550e8400-e29b-41d4-a716-4466554401b8'),
    },
  },
};