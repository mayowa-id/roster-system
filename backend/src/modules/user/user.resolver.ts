import { Resolver, Query, Mutation, Args } from '@nestjs/graphql';
import { UserService } from './user.service';
import { User } from './entities/user.entity';
import { CreateUserInput, UpdateUserInput } from './dto/user.input';

@Resolver(() => User)
export class UserResolver {
  constructor(private readonly userService: UserService) {}

  @Mutation(() => User, { description: 'Create a new user' })
  async createUser(
    @Args('input') createUserInput: CreateUserInput,
  ): Promise<User> {
    return await this.userService.create(createUserInput);
  }

  @Query(() => [User], { name: 'users', description: 'Get all users' })
  async findAll(): Promise<User[]> {
    return await this.userService.findAll();
  }

  @Query(() => User, { name: 'user', description: 'Get a user by ID' })
  async findOne(@Args('id') id: string): Promise<User> {
    return await this.userService.findOne(id);
  }

  @Mutation(() => User, { description: 'Update a user' })
  async updateUser(
    @Args('id') id: string,
    @Args('input') updateUserInput: UpdateUserInput,
  ): Promise<User> {
    return await this.userService.update(id, updateUserInput);
  }

  @Mutation(() => Boolean, { description: 'Delete a user' })
  async deleteUser(@Args('id') id: string): Promise<boolean> {
    return await this.userService.remove(id);
  }
}