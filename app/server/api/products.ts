export interface ProductRecord {
  id: string
  category: string
  bundleId?: string
  statusFlag?: string
  price: number
  name: {
    th: string
    en: string
  }
}

// Self-hosted mock data source standing in for a real product backend.
// Generic/fictional catalog only — no real client name, domain, or product data.
const products: ProductRecord[] = [
  { id: 'sku-001', category: 'apparel', price: 590, name: { th: 'เสื้อยืดคอกลม', en: 'Crew Neck T-Shirt' } },
  { id: 'sku-002', category: 'apparel', bundleId: 'bundle-summer', price: 890, name: { th: 'เสื้อเชิ้ตแขนสั้น', en: 'Short Sleeve Shirt' } },
  { id: 'sku-003', category: 'apparel', price: 1290, name: { th: 'แจ็คเก็ตกันลม', en: 'Windbreaker Jacket' } },
  { id: 'sku-004', category: 'apparel', statusFlag: 'clearance', price: 450, name: { th: 'กางเกงขาสั้น', en: 'Casual Shorts' } },
  { id: 'sku-005', category: 'apparel', price: 750, name: { th: 'กระโปรงพลีท', en: 'Pleated Skirt' } },
  { id: 'sku-006', category: 'apparel', price: 1590, name: { th: 'เดรสลำลอง', en: 'Casual Dress' } },
  { id: 'sku-007', category: 'footwear', price: 1990, name: { th: 'รองเท้าผ้าใบ', en: 'Canvas Sneakers' } },
  { id: 'sku-008', category: 'footwear', bundleId: 'bundle-rainy', price: 990, name: { th: 'รองเท้ากันน้ำ', en: 'Waterproof Shoes' } },
  { id: 'sku-009', category: 'footwear', price: 2490, name: { th: 'รองเท้าหนังทางการ', en: 'Formal Leather Shoes' } },
  { id: 'sku-010', category: 'footwear', statusFlag: 'new-arrival', price: 1290, name: { th: 'รองเท้าแตะ', en: 'Slide Sandals' } },
  { id: 'sku-011', category: 'accessories', price: 390, name: { th: 'หมวกแก๊ป', en: 'Baseball Cap' } },
  { id: 'sku-012', category: 'accessories', price: 690, name: { th: 'กระเป๋าสะพายข้าง', en: 'Crossbody Bag' } },
  { id: 'sku-013', category: 'accessories', bundleId: 'bundle-travel', price: 1150, name: { th: 'กระเป๋าเป้', en: 'Travel Backpack' } },
  { id: 'sku-014', category: 'accessories', price: 290, name: { th: 'เข็มขัดหนัง', en: 'Leather Belt' } },
  { id: 'sku-015', category: 'accessories', price: 190, name: { th: 'ถุงเท้าแพ็ค 3', en: 'Socks 3-Pack' } },
  { id: 'sku-016', category: 'home-goods', price: 850, name: { th: 'แก้วเซรามิก', en: 'Ceramic Mug' } },
  { id: 'sku-017', category: 'home-goods', statusFlag: 'clearance', price: 1450, name: { th: 'ผ้าปูที่นอน', en: 'Bedsheet Set' } },
  { id: 'sku-018', category: 'home-goods', price: 690, name: { th: 'เทียนหอม', en: 'Scented Candle' } },
  { id: 'sku-019', category: 'home-goods', bundleId: 'bundle-kitchen', price: 1290, name: { th: 'ชุดหม้อสแตนเลส', en: 'Stainless Pot Set' } },
  { id: 'sku-020', category: 'home-goods', price: 550, name: { th: 'หมอนอิง', en: 'Throw Pillow' } },
  { id: 'sku-021', category: 'electronics-accessories', price: 490, name: { th: 'สายชาร์จ USB-C', en: 'USB-C Charging Cable' } },
  { id: 'sku-022', category: 'electronics-accessories', price: 990, name: { th: 'พาวเวอร์แบงค์', en: 'Portable Power Bank' } },
  { id: 'sku-023', category: 'electronics-accessories', statusFlag: 'new-arrival', price: 1990, name: { th: 'หูฟังไร้สาย', en: 'Wireless Earbuds' } },
  { id: 'sku-024', category: 'stationery', price: 120, name: { th: 'สมุดโน้ต', en: 'Notebook' } },
  { id: 'sku-025', category: 'stationery', bundleId: 'bundle-office', price: 350, name: { th: 'ปากกาเซ็ต', en: 'Pen Set' } },
]

export default defineEventHandler(() => products)
