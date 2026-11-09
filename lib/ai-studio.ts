
export type AIToolCategory =
  | 'Marketing'
  | 'Sales'
  | 'Product Content'
  | 'Customer Support'
  | 'Design';

export type AITool = {
  id: string;
  name: string;
  description: string;
  category: AIToolCategory;
  icon: string;
  instructions: string;
  inputPlaceholder: string;
};

export const aiTools: AITool[] = [
  {
    id: 'product-description',
    name: 'Product Description Writer',
    description: 'Create attractive product descriptions for your catalog.',
    category: 'Product Content',
    icon: 'package',
    instructions:
      'Write a persuasive ecommerce product description for Niman Prints. Include an attractive headline, key benefits, product features, personalization possibilities, a clear call to action, and suitable hashtags. Use natural language for customers in Nepal. Do not invent product specifications.',
    inputPlaceholder:
      'Enter product name, price, materials, size, features and customization options...',
  },
  {
    id: 'facebook-ad',
    name: 'Facebook Ad Copy',
    description: 'Create scroll-stopping Facebook advertising copy.',
    category: 'Marketing',
    icon: 'megaphone',
    instructions:
      'Create three different Facebook ad copy variations for Niman Prints. Each should have a strong opening hook, customer benefit, product details, offer if provided, and WhatsApp call to action. Keep the language conversational and suitable for Nepalese customers. Do not invent discounts or product claims.',
    inputPlaceholder:
      'Describe the product, target audience, price, offer and campaign objective...',
  },
  {
    id: 'instagram-caption',
    name: 'Instagram Caption Generator',
    description: 'Write engaging captions and relevant hashtags.',
    category: 'Marketing',
    icon: 'instagram',
    instructions:
      'Write three engaging Instagram captions for Niman Prints. Use an emotional or curiosity-driven opening, highlight personalization benefits, include a clear call to action and relevant hashtags. Avoid excessive hashtags and unsupported claims.',
    inputPlaceholder:
      'Describe the product, audience, theme and message...',
  },
  {
    id: 'whatsapp-reply',
    name: 'WhatsApp Reply Assistant',
    description: 'Prepare helpful and professional customer replies.',
    category: 'Customer Support',
    icon: 'message-circle',
    instructions:
      'Draft a friendly, professional WhatsApp reply for a Niman Prints customer. Answer based only on the information provided. If important information such as price, delivery charge, availability or delivery time is missing, ask the customer for clarification instead of inventing an answer. Keep the message concise.',
    inputPlaceholder:
      'Paste the customer message and provide the correct product, price and delivery details...',
  },
  {
    id: 'sales-assistant',
    name: 'Sales Conversation Assistant',
    description: 'Help turn product inquiries into genuine orders.',
    category: 'Sales',
    icon: 'shopping-bag',
    instructions:
      'Act as a helpful sales assistant for Niman Prints. Review the customer conversation and suggest a natural next reply that understands the customer need, answers objections honestly and guides them toward ordering. Never pressure customers or invent availability, delivery promises or discounts.',
    inputPlaceholder:
      'Paste the customer conversation and describe the product...',
  },
  {
    id: 'design-prompt',
    name: 'Print Design Prompt Builder',
    description: 'Create detailed prompts for personalized print designs.',
    category: 'Design',
    icon: 'palette',
    instructions:
      'Create a detailed image-generation prompt for a personalized Niman Prints product design. Specify the visual theme, color palette, composition, typography, decorative elements, customer name and print layout. Preserve any supplied personal photo or face exactly when requested. Avoid third-party copyrighted characters and logos. Include the intended print dimensions if provided.',
    inputPlaceholder:
      'Enter customer name, product type, theme, colors, dimensions and design requirements...',
  },
  {
    id: 'campaign-ideas',
    name: 'Campaign Idea Generator',
    description: 'Develop marketing angles for your products.',
    category: 'Marketing',
    icon: 'lightbulb',
    instructions:
      'Generate five practical marketing campaign ideas for Niman Prints. For each idea provide target audience, customer problem or motivation, creative angle, sample headline, suggested visual and call to action. Consider Nepalese customers and realistic small-business advertising budgets. Do not promise campaign results.',
    inputPlaceholder:
      'Describe the product, target market, budget and campaign goal...',
  },
  {
    id: 'gift-caption',
    name: 'Personalized Gift Message Writer',
    description: 'Create emotional messages for personalized gifts.',
    category: 'Product Content',
    icon: 'gift',
    instructions:
      'Write five original, warm and memorable short messages suitable for personalized gifts sold by Niman Prints. Match the occasion, recipient and tone supplied by the user. Avoid generic wording and keep messages suitable for printing where requested.',
    inputPlaceholder:
      'Enter the occasion, recipient, relationship, language and preferred tone...',
  },
];

export const aiStudioCategories: AIToolCategory[] = [
  'Marketing',
  'Sales',
  'Product Content',
  'Customer Support',
  'Design',
];

export const aiStudioBrandContext = {
  businessName: 'Niman Prints',
  businessType: 'Customized printing and personalized gifts',
  market: 'Nepal',
  currency: 'NPR',
  primaryContactChannel: 'WhatsApp',
  deliveryCoverage: 'Across Nepal',
};
