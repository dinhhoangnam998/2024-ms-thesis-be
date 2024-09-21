import { BaseError } from '@hoangnam.io/qa-tools';

// TODO: don't directly use error handler from qa-tools lib
// because it's hard to customize error handling
class InputDataInvalid extends BaseError {
  constructor({ message = 'Dữ liệu đầu vào không hợp lệ', details = {} }) {
    super(message, details, 400);
    this.name = 'InputDataInvalid';
  }
}

class QueryParamsInvalid extends BaseError {
  constructor({ message = 'Query params không hợp lệ!', details = {} }) {
    super(message, details, 400);
    this.name = 'QueryParamsInvalid';
  }
}

class ResourceNotFound extends BaseError {
  constructor({ message = 'Không tìm thấy tài nguyên!', details = {} }) {
    super(message, details, 400);
    this.name = 'ResourceNotFound';
  }
}

class BadRequest extends BaseError {
  constructor({ message = 'Bad request!', details = {} }) {
    super(message, details, 400);
    this.name = 'BadRequest';
  }
}

class CodeLogicError extends BaseError {
  constructor({ message = 'CodeLogicError', details = {} }) {
    super(message, details, 500);
    this.name = 'CodeLogicError';
  }
}

class NotAllowed extends BaseError {
  constructor({ message = 'NotAllowed!', details = {} }) {
    super(message, details, 400);
    this.name = 'NotAllowed';
  }
}

export { InputDataInvalid, QueryParamsInvalid, ResourceNotFound, BadRequest, CodeLogicError, NotAllowed };
