class Message < ApplicationRecord
  belongs_to :user
  validates :message, presence: true

  def as_json(params={})
    attr = super
    attr[:user] = user.as_json(params)
    attr[:created_at] = created_at.strftime('%d.%m.%Y %H:%M')
    attr
  end
end
