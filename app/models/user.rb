class User < ApplicationRecord

  has_secure_password
  validates :password, presence: true, confirmation: true, length: {minimum: 3, maximum: 16}, if: lambda { |m| m.password.present? }
  validates :login, presence: true, format: {with: /\A[A-z0-9]+\Z/}, uniqueness: true

  has_many :user_orders

  def token
    container = {
        id: self.id,
        expire: 7.days.from_now.to_i
    }
    JWT.encode(container, ENV['JWT_SALT'])
  end

  def as_json(params = {})
    super.except("password_digest")
  end

end
