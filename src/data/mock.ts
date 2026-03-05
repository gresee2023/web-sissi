export interface Tag {
  id: string;
  name: string;
  color: string;
}

export const TAGS: Tag[] = [
  { id: "all", name: "全部", color: "bg-gray-100 text-gray-600" },
  { id: "study", name: "学习", color: "bg-blue-100 text-blue-600" },
  { id: "idol", name: "爱豆", color: "bg-pink-100 text-pink-600" },
  { id: "daily", name: "日常", color: "bg-amber-100 text-amber-600" },
  { id: "food", name: "美食", color: "bg-green-100 text-green-600" },
  { id: "thoughts", name: "碎碎念", color: "bg-purple-100 text-purple-600" },
  { id: "travel", name: "出游", color: "bg-cyan-100 text-cyan-600" },
];

export interface Post {
  id: string;
  content: string;
  imageUrls: string[];
  tags: string[];
  createdAt: string;
}
