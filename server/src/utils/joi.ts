import joi from 'joi'
import logger from './logger'

class Joi {
  instance: typeof joi = joi

  constructor() {}

  async validate(schema: Record<string, any>, body: Record<string, any>) {
    try {
      await this.instance.object(schema).validateAsync(body)
    } catch (error: any) {
      logger.debug({ err: error.message }, 'Validation failed')

      return {
        statusCode: 400,
        message: error.message,
      }
    }
  }
}

export default new Joi()
