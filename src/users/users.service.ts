import { Injectable } from '@nestjs/common';

@Injectable()
export class UsersService {
  getUsers() {
    return [
      {
        id: 1,
        name: 'Abhishek',
        email: 'abhishek@meritix.in',
      },
      {
        id: 2,
        name: 'Rahul',
        email: 'rahul@meritix.in',
      },
      {
        id: 3,
        name: 'Priya',
        email: 'priya@meritix.in',
      },
    ];
  }
}
