class CreateMessages < ActiveRecord::Migration[6.0]
  def change
    create_table :messages do |t|
      t.belongs_to :user
      t.string :message
      t.timestamps
    end
  end
end
