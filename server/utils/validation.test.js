const expect = require('expect')

//im port isRealString
const {isRealString} = require('./validation')
// isRealString
//  should reject non-string values
  //shoudl rejet string only spaces
  //should allow strin with non spacoing chars

describe('isRealString', () => {
  it('should reject non string values', () => {
    var res = isRealString(98)
    expect(res).toBe(false)
    })

    it('should reject string with only spaces', () => {
      var res = isRealString('      ')
      expect(res).toBe(false)
    })

    it('should allow string with non-spacing characters', () => {
      var res = isRealString('     Phil    ')
      expect(res).toBe(true)
    })
})
