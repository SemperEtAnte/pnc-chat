class V1::UserController < ApplicationController
  before_action :verify_token, except: [:login, :logout, :create, :register]

  def me
    render json: @user
  end
  def login
    user = User.find_by(login: params[:login])
    raise Err::Exceptions::UserNotFound unless user
    raise Err::Exceptions::IncorrectPassword unless user.authenticate(params[:password])
    render json: {token: user.token, id: user.id}
  end

  def create

    user = User.find_by(login: params[:login])
    raise Err::Exceptions::LoginUsed if user
    raise Err::Exceptions::PasswordAbsent unless params[:password]
    user = User.new(login: params[:login], password: params[:password])
    assert_save(user)
    render json: {token: user.token, id: user.id}
  end

  def logout
    token = request.headers[:Authorization]
    raise Err::Exceptions::InvalidToken if BlackListToken.find_by(token: token)
    payload = JWT.decode(token, ENV['JWT_SALT'])
    raise Err::Exceptions::InvalidToken unless payload
    user_data = payload[0]
    raise Err::Exceptions::TokenExpired if user_data["expire"] < Time.now.to_i
    BlackListToken.create(token: token, expires: Time.at(user_data["expire"]))
    render json: {logged_out: true}
  end

end
