export interface ApiResponse<T = unknown> {
  success: boolean;
  message: string;
  data: T;
}

export interface PaginationDTO {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNextPage: boolean;
}

export interface PaginatedResponse<T> {
  items: T[];
  pagination: PaginationDTO;
}

export interface UserDTO {
  id: string;
  username: string;
  name: string;
  avatarUrl: string | null;
  roleId: string | number;
  roleName?: string;
  bio: string | null;
  isOwnProfile?: boolean;
  activeBan?: BanDTO | null;
}

export interface BanDTO {
  id: string;
  reason: string;
  adminId: string;
  expiresAt: string | null;
}

export interface PostDTO {
  id: string;
  content: string;
  createdAt: string | null;
  updatedAt: string | null;
  userId: string;
  authorName?: string;
  authorAvatarUrl?: string | null;
  likeCount?: number;
  isLikedByMe?: boolean;
}

export type FriendshipStatus = 'ACCEPTED' | 'REJECTED' | 'BLOCKED' | 'PENDING';

export interface FriendshipDTO {
  id: string;
  requesterId: string;
  receiverId: string;
  status: FriendshipStatus;
  createdAt: string;
  updatedAt: string;
}

export interface FriendDTO {
  friendshipId: string;
  since: string | null;
  user: Omit<UserDTO, 'roleId' | 'activeBan' | 'isOwnProfile'>;
}

export interface FriendRequestDTO {
  id: string;
  status: FriendshipStatus;
  createdAt: string | null;
  user: Omit<UserDTO, 'roleId' | 'activeBan' | 'isOwnProfile'>;
}

export interface AuthResponseDTO {
  user?: UserDTO;
  require2FA?: boolean;
}

export interface TwoFAInfoDTO {
  qrCodeImage: string;
  secret: string;
}

export interface ApiErrorData {
  errorCode?: number;
  reason?: string;
  expiresAt?: string | null;
  [key: string]: unknown;
}

export interface ApiErrorResponse {
  success: false;
  message: string;
  data?: ApiErrorData;
}
