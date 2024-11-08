import { UnprocessableEntityException, ValidationError } from '@nestjs/common';

export const ValidatorErrorHandler = {
  exceptionFactory: (errors: ValidationError[]) => {
    const result = errors.map((error) => {
      let message;
      if (error?.children?.[0]?.children?.length) {
        message = Object.values(
          error?.children?.[0]?.children?.[0]?.constraints || {},
        )[0];
      } else {
        message = Object.values(error.constraints || {})[0];
      }

      return { property: error.property, message };
    });

    return new UnprocessableEntityException(result[0].message);
  },

  whitelist: true,
  stopAtFirstError: true,
};
