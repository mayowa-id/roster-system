import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { CreateUserInput, UpdateUserInput } from './dto/user.input';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async create(createUserInput: CreateUserInput): Promise<User> {
    // Check if email already exists
    const existingUser = await this.userRepository.findOne({
      where: { email: createUserInput.email },
    });

    if (existingUser) {
      throw new ConflictException('User with this email already exists');
    }

    const user = this.userRepository.create(createUserInput);
    return await this.userRepository.save(user);
  }

  async findAll(): Promise<User[]> {
    return await this.userRepository.find({
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: string): Promise<User> {
    const user = await this.userRepository.findOne({
      where: { id },
      relations: ['assignments', 'assignments.shift', 'assignments.shift.timeslot'],
    });

    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    return user;
  }

  async update(id: string, updateUserInput: UpdateUserInput): Promise<User> {
    const user = await this.findOne(id);

    // Check email uniqueness if updating email
    if (updateUserInput.email && updateUserInput.email !== user.email) {
      const existingUser = await this.userRepository.findOne({
        where: { email: updateUserInput.email },
      });

      if (existingUser) {
        throw new ConflictException('User with this email already exists');
      }
    }

    Object.assign(user, updateUserInput);
    return await this.userRepository.save(user);
  }

  async remove(id: string): Promise<boolean> {
    const user = await this.findOne(id);
    await this.userRepository.remove(user);
    return true;
  }
}