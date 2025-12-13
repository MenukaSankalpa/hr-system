import bcrypt from 'bcryptjs';

    const password = '123456';

    const hashPassword = async () => {
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);
        console.log(`Password: ${password}`);
        console.log(`Hashed Password (use this in MongoDB): ${hashedPassword}`);
        process.exit();
    };

    hashPassword();