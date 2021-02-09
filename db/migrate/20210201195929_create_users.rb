class CreateUsers < ActiveRecord::Migration[6.0]
  def change
    create_table :users do |t|
      t.string :login, unique: true
      t.string :password_digest
      t.timestamp :last_view
      t.string :avatar
      t.timestamps
    end
  end
end
