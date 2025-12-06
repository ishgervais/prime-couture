import { Injectable, UnauthorizedException } from '@nestjs/common'
import { JwtService } from '@nestjs/jwt'
import bcrypt from 'bcrypt'
import { PrismaClient } from '@prisma/client'
import { LoginDto } from './dto/login.dto'
import { CreateUserDto } from './dto/create-user.dto'

@Injectable()
export class AuthService {
    private readonly prisma = new PrismaClient()

    constructor(private jwt: JwtService) {}

    async validateUser(email: string, password: string) {
        const user = await this.prisma.user.findUnique({ where: { email } })
        if (!user) return null

        const matches = await bcrypt.compare(password, user.passwordHash)
        if (!matches) return null

        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { passwordHash: _omit, ...safeUser } = user
        return safeUser
    }

    async login(dto: LoginDto) {
        const user = await this.validateUser(dto.email, dto.password)
        if (!user) {
            throw new UnauthorizedException('Invalid credentials')
        }

        const payload = { sub: user.id, email: user.email, role: user.role }
        return {
            accessToken: this.jwt.sign(payload),
            user,
        }
    }

    async me(userId: string) {
        const user = await this.prisma.user.findUnique({
            where: { id: userId },
        })
        if (!user) {
            throw new UnauthorizedException()
        }
        const { passwordHash: passwordHashToOmit, ...safeUser } = user
        void passwordHashToOmit
        return safeUser
    }

    async createUser(dto: CreateUserDto) {
        const exists = await this.prisma.user.findUnique({
            where: { email: dto.email },
        })
        if (exists) {
            throw new UnauthorizedException('Email already exists')
        }
        const hashedPassword = await bcrypt.hash(dto.password, 10)
        const user = await this.prisma.user.create({
            data: {
                name: dto.name,
                email: dto.email,
                passwordHash: hashedPassword,
                role: dto.role,
            },
        })
        const { passwordHash: _pw, ...safeUser } = user
        void _pw
        return safeUser
    }

    async listUsers() {
        const users = await this.prisma.user.findMany({
            orderBy: { createdAt: 'desc' },
        })
        return users.map((user) => {
            const { passwordHash: passwordHashToOmit, ...rest } = user
            void passwordHashToOmit
            return rest
        })
    }

    async removeUser(id: string) {
        const user = await this.prisma.user.findUnique({ where: { id } })
        if (!user) throw new UnauthorizedException('User not found')
        await this.prisma.user.delete({ where: { id } })
        return { success: true }
    }
}
