import { NestFactory } from '@nestjs/core'
import { AppModule } from './app.module'
import { ValidationPipe } from '@nestjs/common'
import helmet from 'helmet'
import cookieParser from 'cookie-parser'
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger'
import type { Request, Response, NextFunction } from 'express'

function swaggerBasicAuth(req: Request, res: Response, next: NextFunction) {
    const user = process.env.SWAGGER_USER
    const pass = process.env.SWAGGER_PASSWORD
    if (!user || !pass) return next()

    const header = req.headers.authorization || ''
    const token = header.startsWith('Basic ') ? header.slice(6) : ''
    const decoded = token ? Buffer.from(token, 'base64').toString() : ''
    const [authUser, authPass] = decoded.split(':')

    if (authUser === user && authPass === pass) return next()

    res.set('WWW-Authenticate', 'Basic realm="Swagger Docs"')
    return res.status(401).send('Authentication required')
}

async function bootstrap() {
    const app = await NestFactory.create(AppModule, { cors: true })
    app.use(helmet())
    app.use(cookieParser())
    const allowedOrigins =
        process.env.FRONTEND_URL?.split(',')
            .map((o) => o.trim())
            .filter(Boolean) || []

    // If no explicit origins are set, allow all without credentials; otherwise use the provided list and allow credentials.
    app.enableCors({
        origin: allowedOrigins.length > 0 ? allowedOrigins : true,
        credentials: allowedOrigins.length > 0,
    })
    app.useGlobalPipes(
        new ValidationPipe({
            whitelist: true,
            forbidUnknownValues: false,
            transform: true,
        })
    )

    app.use(['/docs', '/docs-json'], swaggerBasicAuth)

    const config = new DocumentBuilder()
        .setTitle('Prime Couture API')
        .setDescription('Prime Couture ecommerce backend API documentation')
        .setVersion('1.0.0')
        .addBearerAuth()
        .build()
    const document = SwaggerModule.createDocument(app, config)
    SwaggerModule.setup('docs', app, document)

    const port = process.env.PORT || 3000
    await app.listen(port)
    // eslint-disable-next-line no-console
    console.log(`Prime Couture backend running on http://localhost:${port}`)
}

bootstrap()
