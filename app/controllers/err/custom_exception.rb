module Err
  class CustomException < StandardError
    attr_accessor :status

    def initialize(msg = "", code = 500)
      super(msg)
      @status = code
    end
  end
end