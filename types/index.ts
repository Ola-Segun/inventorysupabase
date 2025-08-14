// export interface Products {
//   id: number
//   name: string
//   sku: string
//   description: string
//   cost_price: number
//   price: number
//   quantity: number
//   category_id: number
//   created_at: string
//   updated_at: string
//   file: File | null
//   image_url?: string | ''
//   cost?: number
//   category?: {
//     id: number
//     name: string
//     created_at: string
//     updated_at: string
//   }
//   barcode?: string
// }

// export interface User {
//   name: string
//   email: string
//   role: string
//   password?: string
//   password_confirmation?: string
// }

// export interface LoginCredentials {
//   email: string;
//   password: string;
// }

// export interface RegisterCredentials {
//   name: string;
//   email: string;
//   password: string;
//   password_confirmation: string;
// }

// export interface AuthResponse {
//   user: User
//   access_token?: string
//   [key: string]: any; // fallback if backend sends more
// }




// types/index.ts - Main types file

// ==================== COMMON/BASE TYPES ====================

// Base entity with common fields
export interface BaseEntity {
  id: number;
  created_at: string;
  updated_at: string;
}

// Pagination types
export interface PaginationMeta {
  current_page: number;
  from: number | null;
  last_page: number;
  per_page: number;
  to: number | null;
  total: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  meta: PaginationMeta;
  links: {
    first: string;
    last: string;
    prev: string | null;
    next: string | null;
  };
}

// API Response wrapper
export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
  errors?: Record<string, string[]>;
}

// CRUD operation types
export type CrudOperation = 'create' | 'read' | 'update' | 'delete';

// Form states
export type FormMode = 'create' | 'edit' | 'view';

// ==================== AUTH TYPES ====================

export interface User extends BaseEntity {
  name: string;
  email: string;
  email_verified_at?: string | null;
  role?: string;
  avatar?: string;
  // phone?: string;
  status?: 'active' | 'inactive' | 'suspended';
}

export interface AuthResponse {
  user: User;
  message: string;
  token?: string; // if using token-based auth
}

export interface LoginCredentials {
  email: string;
  password: string;
  remember?: boolean;
}

export interface RegisterData {
  name: string;
  email: string;
  password: string;
  password_confirmation: string;
}

// ==================== EXAMPLE ENTITY TYPES ====================

// Product entity example
export interface Product extends BaseEntity {
  name: string;
  description?: string;
  price: number;
  sku: string;
  category_id: number;
  category?: Category;
  stock_quantity: number;
  status: 'active' | 'inactive' | 'discontinued';
  images?: ProductImage[];
  tags?: Tag[];
}

// Product form data (for create/update)
export interface ProductFormData {
  name: string;
  description?: string;
  price: number;
  sku: string;
  category_id: number;
  stock_quantity: number;
  status: 'active' | 'inactive' | 'discontinued';
  image_files?: File[];
  tag_ids?: number[];
}

// Category entity
export interface Category extends BaseEntity {
  name: string;
  slug: string;
  description?: string;
  parent_id?: number;
  parent?: Category;
  children?: Category[];
  products_count?: number;
  status: 'active' | 'inactive';
}

export interface CategoryFormData {
  name: string;
  description?: string;
  parent_id?: number;
  status: 'active' | 'inactive';
}

// Product Image
export interface ProductImage extends BaseEntity {
  product_id: number;
  url: string;
  alt_text?: string;
  is_primary: boolean;
  sort_order: number;
}

// Tag entity
export interface Tag extends BaseEntity {
  name: string;
  slug: string;
  color?: string;
}

// ==================== CRUD HOOKS TYPES ====================

// Generic CRUD state
export interface CrudState<T> {
  items: T[];
  currentItem: T | null;
  isLoading: boolean;
  isSubmitting: boolean;
  error: string | null;
  formMode: FormMode;
  pagination?: PaginationMeta;
}

// CRUD actions
export interface CrudActions<T, TFormData = Partial<T>> {
  fetchItems: (params?: QueryParams) => Promise<void>;
  fetchItem: (id: number) => Promise<void>;
  createItem: (data: TFormData) => Promise<T>;
  updateItem: (id: number, data: TFormData) => Promise<T>;
  deleteItem: (id: number) => Promise<void>;
  setCurrentItem: (item: T | null) => void;
  setFormMode: (mode: FormMode) => void;
  clearError: () => void;
}

// Query parameters for filtering/searching
export interface QueryParams {
  page?: number;
  per_page?: number;
  search?: string;
  sort_by?: string;
  sort_order?: 'asc' | 'desc';
  filters?: Record<string, any>;
}

// ==================== FORM TYPES ====================

// Generic form state
export interface FormState<T> {
  data: T;
  errors: Record<keyof T, string>;
  isDirty: boolean;
  isValid: boolean;
  isSubmitting: boolean;
}

// Form field configuration
export interface FormField {
  name: string;
  label: string;
  type: 'text' | 'email' | 'password' | 'number' | 'textarea' | 'select' | 'checkbox' | 'file' | 'date';
  required?: boolean;
  placeholder?: string;
  options?: { value: any; label: string }[];
  validation?: ValidationRule[];
}

// Validation rules
export interface ValidationRule {
  type: 'required' | 'email' | 'min' | 'max' | 'pattern';
  value?: any;
  message: string;
}

// ==================== TABLE/LIST TYPES ====================

// Table column configuration
export interface TableColumn<T = any> {
  key: keyof T | string;
  label: string;
  sortable?: boolean;
  searchable?: boolean;
  width?: string;
  align?: 'left' | 'center' | 'right';
  render?: (value: any, item: T) => React.ReactNode;
  hidden?: boolean;
}

// Table action
export interface TableAction<T = any> {
  label: string;
  icon?: React.ReactNode;
  color?: 'primary' | 'secondary' | 'success' | 'warning' | 'danger';
  onClick: (item: T) => void;
  show?: (item: T) => boolean;
}

// List/Table props
export interface DataTableProps<T> {
  data: T[];
  columns: TableColumn<T>[];
  actions?: TableAction<T>[];
  loading?: boolean;
  pagination?: PaginationMeta;
  onPageChange?: (page: number) => void;
  onSort?: (column: string, direction: 'asc' | 'desc') => void;
  onSearch?: (query: string) => void;
  selectable?: boolean;
  onSelectionChange?: (selectedItems: T[]) => void;
}

// ==================== NOTIFICATION TYPES ====================

export interface Notification {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message?: string;
  duration?: number;
  persistent?: boolean;
  actions?: NotificationAction[];
}

export interface NotificationAction {
  label: string;
  action: () => void;
  style?: 'primary' | 'secondary';
}

// ==================== MODAL/DIALOG TYPES ====================

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
  persistent?: boolean;
}

export interface ConfirmDialogProps extends ModalProps {
  message: string;
  onConfirm: () => void;
  confirmText?: string;
  cancelText?: string;
  type?: 'info' | 'warning' | 'danger';
}

// ==================== UPLOAD TYPES ====================

export interface UploadFile {
  id: string;
  file: File;
  name: string;
  size: number;
  type: string;
  url?: string;
  progress: number;
  status: 'pending' | 'uploading' | 'success' | 'error';
  error?: string;
}

export interface FileUploadProps {
  accept?: string;
  multiple?: boolean;
  maxSize?: number;
  maxFiles?: number;
  onFilesChange: (files: UploadFile[]) => void;
  onUpload?: (files: File[]) => Promise<string[]>;
}

// ==================== SPECIFIC ENTITY EXTENSIONS ====================

// Extend base types for specific entities
export interface ProductWithRelations extends Product {
  category: Category;
  images: ProductImage[];
  tags: Tag[];
}

// Search/Filter specific types
export interface ProductFilters {
  category_id?: number;
  price_min?: number;
  price_max?: number;
  status?: Product['status'];
  in_stock?: boolean;
  tags?: number[];
}

export interface CategoryFilters {
  parent_id?: number;
  status?: Category['status'];
  has_products?: boolean;
}

// ==================== UTILITY TYPES ====================

// Make all properties optional for updates
export type PartialBy<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;

// Omit common fields for form data
export type FormDataType<T extends BaseEntity> = Omit<T, 'id' | 'created_at' | 'updated_at'>;

// Select options type
export interface SelectOption<T = any> {
  value: T;
  label: string;
  disabled?: boolean;
  group?: string;
}

// API endpoints configuration
export interface ApiEndpoints {
  [key: string]: {
    list: string;
    show: string;
    create: string;
    update: string;
    delete: string;
  };
}

// // ==================== EXPORT COLLECTIONS ====================

// // Export commonly used type collections
// export type {
//   // Auth related
//   User,
//   AuthResponse,
//   LoginCredentials,
//   RegisterData,
  
//   // Product related
//   Product,
//   ProductFormData,
//   ProductWithRelations,
//   ProductFilters,
  
//   // Category related
//   Category,
//   CategoryFormData,
//   CategoryFilters,
  
//   // Generic CRUD
//   CrudState,
//   CrudActions,
//   FormState,
//   QueryParams,
  
//   // UI Components
//   TableColumn,
//   TableAction,
//   DataTableProps,
//   ModalProps,
//   ConfirmDialogProps,
  
//   // Utility
//   BaseEntity,
//   PaginatedResponse,
//   ApiResponse,
//   SelectOption,
// };

// Type guards
export const isUser = (obj: any): obj is User => {
  return obj && typeof obj.id === 'number' && typeof obj.email === 'string';
};

export const isProduct = (obj: any): obj is Product => {
  return obj && typeof obj.id === 'number' && typeof obj.name === 'string' && typeof obj.price === 'number';
};

// Default values
export const defaultQueryParams: QueryParams = {
  page: 1,
  per_page: 15,
  sort_by: 'created_at',
  sort_order: 'desc',
};

export const defaultPagination: PaginationMeta = {
  current_page: 1,
  from: null,
  last_page: 1,
  per_page: 15,
  to: null,
  total: 0,
};