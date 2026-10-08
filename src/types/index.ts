export interface IUserHobby {
  hobbyId: string;
  hobbyName: string;
  skillLevel: 'Beginner' | 'Intermediate' | 'Advanced' | 'Mentor';
  yearsExperience?: number;
}

export interface IUser {
  _id: string;
  name: string;
  username: string;
  email: string;
  avatar: string;
  bio: string;
  location: string;
  availability: string;
  hobbies: IUserHobby[];
  matchScore?: number;
  sharedHobbyNames?: string[];
  complementarySkills?: string[];
  relationship?: 'none' | 'connected' | 'pending_incoming' | 'pending_outgoing' | 'declined';
  connectionId?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface IHobby {
  _id: string;
  name: string;
  category:
    | 'Sports & Outdoors'
    | 'Creative & Arts'
    | 'Tech & Gaming'
    | 'Music & Audio'
    | 'Culinary & Food'
    | 'Learning & Science'
    | 'Lifestyle & Wellness';
  description: string;
  icon: string;
  tags: string[];
  bannerImage: string;
  memberCount: number;
  difficulty: 'All Levels' | 'Beginner Friendly' | 'Intermediate' | 'Advanced';
  isJoined?: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface IConnectionPartner {
  _id: string;
  name: string;
  username: string;
  avatar: string;
  bio: string;
  location: string;
  hobbies: IUserHobby[];
}

export interface IConnection {
  _id: string;
  status: 'pending' | 'accepted' | 'declined';
  partner: IConnectionPartner;
  introMessage?: string;
  hobbyContext?: string;
  createdAt: string;
  updatedAt: string;
}

export interface IMessage {
  _id: string;
  sender: string;
  recipient: string;
  content: string;
  hobbyContext?: string;
  read: boolean;
  createdAt: string;
}

export interface IConversation {
  contact: IUser;
  lastMessage: {
    content: string;
    hobbyContext?: string;
    createdAt: string;
    sender: string;
  };
  unreadCount: number;
}

export interface IComment {
  _id: string;
  author: string;
  authorName: string;
  authorAvatar: string;
  content: string;
  createdAt: string;
}

export interface IPost {
  _id: string;
  author: {
    _id: string;
    name: string;
    username: string;
    avatar: string;
    location: string;
  };
  hobbyName: string;
  hobbyId?: string;
  title: string;
  content: string;
  imageUrl?: string;
  tags: string[];
  likesCount: number;
  hasLiked: boolean;
  comments: IComment[];
  createdAt: string;
}

export interface IDbStatus {
  success: boolean;
  stack: {
    database: string;
    odm: string;
    backend: string;
    runtime: string;
    frontend: string;
  };
  connection: {
    isConnected: boolean;
    readyState: number;
    databaseName: string;
    host: string;
    source?: 'external' | 'embedded';
    externalError?: string | null;
  };
  counts: {
    users: number;
    hobbies: number;
    connections: number;
    messages: number;
    posts: number;
  };
  collections: string[];
}
