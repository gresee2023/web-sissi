export interface Post {
  id: string;
  images: string[];
  content: string;
  tags: string[];
  createdAt: string;
}

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

export const POSTS: Post[] = [
  {
    id: "1",
    images: [
      "https://images.unsplash.com/photo-1481349518771-20055b2a7b24?w=400&h=300&fit=crop",
    ],
    content: "今天数学考试考了98分！开心到飞起～终于把那道难题搞懂了，感谢我的小台灯陪我熬夜复习",
    tags: ["学习"],
    createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "2",
    images: [
      "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=400&h=500&fit=crop",
      "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=400&h=400&fit=crop",
      "https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?w=400&h=450&fit=crop",
    ],
    content: "周末和妈妈一起做了草莓蛋糕！第一次尝试裱花，虽然有点歪但是超级好吃！",
    tags: ["美食", "日常"],
    createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "3",
    images: [
      "https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=400&h=400&fit=crop",
    ],
    content: "啊啊啊啊！！！新专辑终于发了！！循环一整天停不下来，每一首都好好听呜呜呜",
    tags: ["爱豆"],
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "4",
    images: [
      "https://images.unsplash.com/photo-1497633762265-9d179a990aa6?w=400&h=350&fit=crop",
      "https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?w=400&h=400&fit=crop",
    ],
    content: "新买的手账本到啦～粉粉嫩嫩的超级可爱！已经迫不及待想要开始记录了",
    tags: ["日常"],
    createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "5",
    images: [
      "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=500&fit=crop",
    ],
    content: "放假去爬山啦！山顶的风景太美了，感觉所有烦恼都被吹散了～",
    tags: ["出游", "日常"],
    createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "6",
    images: [
      "https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=400&h=380&fit=crop",
    ],
    content: "为什么英语单词总是背了就忘啊...明天还要听写，我太难了",
    tags: ["学习", "碎碎念"],
    createdAt: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "7",
    images: [
      "https://images.unsplash.com/photo-1495195134817-aeb325a55b65?w=400&h=450&fit=crop",
      "https://images.unsplash.com/photo-1484723091739-30a097e8f929?w=400&h=400&fit=crop",
    ],
    content: "发现学校门口新开了一家奶茶店！芋泥波波超好喝，以后放学又多了一个理由慢慢走回家了哈哈",
    tags: ["美食"],
    createdAt: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "8",
    images: [
      "https://images.unsplash.com/photo-1529778873920-4da4926a72c2?w=400&h=400&fit=crop",
    ],
    content: "突然好想养一只猫咪...但是妈妈说等我上高中再说。还要等好久啊",
    tags: ["碎碎念"],
    createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
  },
];
