class ApplicationController < ActionController::Base
  skip_before_action  :verify_authenticity_token
  rescue_from Exception do |err|
    status = (err.instance_of? Err::CustomException) ? err.status : 500
    logger.error err.message
    logger.error err.backtrace.join("\n")
    render json: {error: err.message}, status: status
  end


  def index
    verify_from_cookie(cookies[:Authorization])
  end

  def save_or_rollback(model)
    unless model.save
      render json: {error: model.errors.full_messages}, status: :unprocessable_entity
      raise ActiveRecord::Rollback
    end
  end

  def assert_save(object)
    raise Err::CustomException.new(object.errors.full_messages, :unprocessable_entity) unless object.save
  end

  def self.static_edit(params, object, excepts = %w(id created_at updated_at))
    toup = Hash.new
    params.each do |key, value|
      if object.respond_to?(key) || key == 'password'
        unless excepts.include?(key)
          if value != nil
            toup[key] = value
          end
        end
      end
    end
    object.assign_attributes(toup)
    if object.valid?
      object.save
    else
      raise Err::CustomException.new(object.errors.full_messages, :unprocessable_entity)
    end
  end

  def verify_token
    token = request.headers[:Authorization]
    raise Err::Exceptions::InvalidToken if BlackListToken.find_by(token: token)
    payload = JWT.decode(token, ENV['JWT_SALT'])
    raise Err::Exceptions::InvalidToken unless payload
    user_data = payload[0]
    raise Err::Exceptions::TokenExpired if user_data["expire"] < Time.now.to_i
    @user = User.find_by(id: user_data["id"])
    raise Err::Exceptions::InvalidToken unless @user
  end

  def edit_object(object, excepts = ["id", "created_at", "updated_at"])
    ApplicationController::static_edit(request.params, object, excepts)
  end

  private

  def verify_from_cookie(token)
    return false unless token
    return false if BlackListToken.find_by(token: token)
    begin
      payload = JWT.decode(token, ENV['JWT_SALT'])
    rescue Exception
      return false
    end
    return false unless payload
    user_data = payload[0]
    return false if user_data["expire"] < Time.now.to_i
    @user = User.find_by(id: user_data["id"])
    return false unless @user
  end
end
