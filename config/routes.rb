Rails.application.routes.draw do
  # For details on the DSL available within this file, see https://guides.rubyonrails.org/routing.html
  root "application#index"
  namespace :v1 do
    controller :user do
      get 'user/register', action: :register
      get 'user/me', action: :me
      post 'user/register', action: :create
      post 'user/login', action: :login
      post 'user/logout', action: :logout
    end
    controller :message do
      get "message/list", action: :list_messages
      get "message", action: :index
      post "message/send", action: :send_message
    end
  end
end
