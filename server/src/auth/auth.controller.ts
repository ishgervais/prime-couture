import { Body, Controller, Get, Post, Request, UseGuards } from '@nestjs/common'
import { ApiBearerAuth, ApiBody, ApiTags } from '@nestjs/swagger'
import { AuthService } from './auth.service'
import { LoginDto } from './dto/login.dto'
import { JwtAuthGuard } from './jwt-auth.guard'
import { CreateUserDto } from './dto/create-user.dto'
import { Delete, Param } from '@nestjs/common'

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
    constructor(private readonly authService: AuthService) {}

    @ApiBody({
        type: LoginDto,
        examples: {
            default: {
                summary: 'Login',
                value: {
                    email: 'admin@primecouture.rw',
                    password: 'ChangeMe123!',
                },
            },
        },
    })
    @Post('login')
    login(@Body() dto: LoginDto) {
        return this.authService.login(dto)
    }

    @ApiBearerAuth()
    @UseGuards(JwtAuthGuard)
    @Get('me')
    me(@Request() req: { user: { userId: string } }) {
        return this.authService.me(req.user.userId)
    }

    @ApiBearerAuth()
    @UseGuards(JwtAuthGuard)
    @Post('me')
    mePost(@Request() req: { user: { userId: string } }) {
        return this.authService.me(req.user.userId)
    }

    @ApiBearerAuth()
    @ApiBody({
        type: CreateUserDto,
        examples: {
            default: {
                summary: 'Create admin',
                value: {
                    name: 'New Admin',
                    email: 'newadmin@primecouture.rw',
                    password: 'StrongPass123!',
                    role: 'ADMIN',
                },
            },
        },
    })
    // @UseGuards(JwtAuthGuard)
    @Post('register')
    createUser(@Body() dto: CreateUserDto) {
        return this.authService.createUser(dto)
    }

    @ApiBearerAuth()
    @UseGuards(JwtAuthGuard)
    @Get('users')
    list() {
        return this.authService.listUsers()
    }

    @ApiBearerAuth()
    @UseGuards(JwtAuthGuard)
    @Delete('users/:id')
    remove(@Param('id') id: string) {
        return this.authService.removeUser(id)
    }
}
