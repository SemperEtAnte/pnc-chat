class ChatChannel < ApplicationCable::Channel
  attr_accessor :message_user

  def subscribed
    self.message_user = verify_token
    reject unless self.message_user
    stream_from "main_chat"
  end

  private

  def verify_token
    token = params[:token]

    return nil if BlackListToken.find_by(token: token)
    payload = JWT.decode(token, ENV['JWT_SALT'])
    return nil unless payload
    user_data = payload[0]
    return nil if user_data["expire"] < Time.now.to_i
    User.find_by(id: user_data["id"])
  end

end