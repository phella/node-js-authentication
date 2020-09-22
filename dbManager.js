const user = require('./user.model');

class dbManager{
	
	async findUser(conditions  , numberOfusers , projectionStr = undefined){
		if(numberOfusers === 1 ){
			const result =  await user.findOne(conditions , projectionStr);
			return {success:true , users:result}
		}else{
			const result =  await user.find(conditions , projectionStr ).limit(numberOfusers);
			return {success:true , users:result} 
		}
	}
	
	async saveUser(account){
		const result = new user(account);
		try { 
			await result.save();
		} catch(err){
			if(err.errors.phoneNo)
				return {success:false,error:"Phone number"};
			else if(err.errors.email)
				return {success:false,error:"Email"};
		}
		return {success:true}
	}
};

module.exports = new dbManager();
