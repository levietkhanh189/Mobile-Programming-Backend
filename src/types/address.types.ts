export interface Address {
  id: number;
  userId: number;
  label: string;
  fullName: string;
  phone: string;
  address: string;
  city: string;
  isDefault: boolean;
  createdAt: Date;
}

export interface CreateAddressDto {
  label?: string;
  fullName: string;
  phone: string;
  address: string;
  city: string;
}
