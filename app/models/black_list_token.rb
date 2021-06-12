class BlackListToken < ApplicationRecord
  validates :token, uniqueness: true
end
