class V1::MessageController < ApplicationController
  before_action :verify_token, except: [:index]

  def index
  end

  def send_message
    msg = Message.create(user_id: @user.id, message: params[:message])
    ActionCable.server.broadcast("main_chat", {message: msg})
    render json: {ok: :ok}, status: :ok

  end

  def list_messages
    limit = params[:limit] ? params[:limit] : 20
    offset = params[:offset] ? params[:offset] : 0
    all = Message.all.count
    messages  = Message.includes(:user).limit(limit).offset(offset).order(created_at: :desc)
    render json: {total: all, messages: messages}
  end


end
