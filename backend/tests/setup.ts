import mongoose from 'mongoose';
import { connectDB, disconnectDB } from '../src/config/db';
import { User } from '../src/models/User';
import { USER_ROLES } from '../src/constants';
import { generateAccessToken } from '../src/utils/token';

export let testAdminToken: string;
export let testCustomerToken: string;
export let testOtherCustomerToken: string;
export let testAdminUser: any;
export let testCustomerUser: any;

export const initTestUsers = async () => {
  let admin = await User.findOne({ email: 'admin@sportzone.com' });
  if (!admin) {
    admin = await User.create({
      name: 'SportZone Admin',
      email: 'admin@sportzone.com',
      password: 'Admin@123456',
      role: USER_ROLES.ADMIN,
      status: 'active',
      isEmailVerified: true,
    });
  }

  let customer = await User.findOne({ email: 'customer@sportzone.com' });
  if (!customer) {
    customer = await User.create({
      name: 'Alex Morgan',
      email: 'customer@sportzone.com',
      password: 'Customer@123456',
      role: USER_ROLES.CUSTOMER,
      status: 'active',
      addresses: [
        {
          fullName: 'Alex Morgan',
          phone: '+1 (555) 019-2834',
          street: '742 Evergreen Terrace',
          city: 'Springfield',
          state: 'OR',
          postalCode: '97477',
          country: 'United States',
          isDefault: true,
          type: 'home',
        },
      ],
      isEmailVerified: true,
    });
  }

  let otherCustomer = await User.findOne({ email: 'other_customer@sportzone.com' });
  if (!otherCustomer) {
    otherCustomer = await User.create({
      name: 'Other Customer',
      email: 'other_customer@sportzone.com',
      password: 'Password@123456',
      role: USER_ROLES.CUSTOMER,
      status: 'active',
      isEmailVerified: true,
    });
  }

  testAdminUser = admin;
  testCustomerUser = customer;

  testAdminToken = generateAccessToken({
    id: admin._id.toString(),
    email: admin.email,
    role: admin.role,
    name: admin.name,
  });

  testCustomerToken = generateAccessToken({
    id: customer._id.toString(),
    email: customer.email,
    role: customer.role,
    name: customer.name,
  });

  testOtherCustomerToken = generateAccessToken({
    id: otherCustomer._id.toString(),
    email: otherCustomer.email,
    role: otherCustomer.role,
    name: otherCustomer.name,
  });
};

beforeAll(async () => {
  await connectDB();
  await initTestUsers();
});

afterAll(async () => {
  await disconnectDB();
});
