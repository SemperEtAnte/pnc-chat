class CreateBlackListTokens < ActiveRecord::Migration[6.0]
  def change
    create_table :black_list_tokens do |t|
      t.string :token
      t.timestamp :expires
    end
  end
end
