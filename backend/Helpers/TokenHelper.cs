using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Security.Cryptography;
using System.Text;
using Microsoft.AspNetCore.Components.Authorization;
using Microsoft.AspNetCore.Cryptography.KeyDerivation;
using Microsoft.IdentityModel.Tokens;
using Tricount.Models;
using Tricount.Models.Entities;

namespace Tricount.Helpers;

public class TokenHelper
{
    private TricountContext _context;
    public TokenHelper(TricountContext context) {
        this._context = context;
    }

    public static string GenerateJwtToken(string email, Role role) {
        var claims = new Claim[]
                {
                    new Claim(ClaimTypes.Name, email),
                    new Claim(ClaimTypes.Role, role.ToString())
                };
        return GenerateJwtToken(claims);
    }

    /*
    IDX10720: Unable to create KeyedHashAlgorithm for algorithm 'http://www.w3.org/2001/04/xmldsig-more#hmac-sha256', 
    the key size must be greater than: '256' bits, key has '152' bits. (Parameter 'keyBytes')
    */

    public static string GenerateJwtToken(IEnumerable<Claim> claims) {
        var tokenHandler = new JwtSecurityTokenHandler();
        var key = Encoding.ASCII.GetBytes("my-super-secret-key my-super-secret-key");
        var tokenDescriptor = new SecurityTokenDescriptor {
            Subject = new ClaimsIdentity(claims),
            IssuedAt = DateTime.UtcNow,
            Expires = DateTime.UtcNow.AddMinutes(10),
            SigningCredentials = new SigningCredentials(new SymmetricSecurityKey(key), SecurityAlgorithms.HmacSha256Signature)
        };
        var token = tokenHandler.CreateToken(tokenDescriptor);
        return tokenHandler.WriteToken(token);
    }

    public static string GenerateRefreshToken() {
        var randomNumber = new byte[32];
        using (var rng = RandomNumberGenerator.Create()) {
            rng.GetBytes(randomNumber);
            return Convert.ToBase64String(randomNumber);
        }
    }

    public static ClaimsPrincipal GetPrincipalFromExpiredToken(string token) {
        var tokenValidationParameters = new TokenValidationParameters {
            ValidateAudience = false, //you might want to validate the audience and issuer depending on your use case
            ValidateIssuer = false,
            ValidateIssuerSigningKey = true,
            IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes("my-super-secret-key my-super-secret-key")),
            ValidateLifetime = false //here we are saying that we don't care about the token's expiration date
        };

        var tokenHandler = new JwtSecurityTokenHandler();
        SecurityToken securityToken;
        var principal = tokenHandler.ValidateToken(token, tokenValidationParameters, out securityToken);
        var jwtSecurityToken = securityToken as JwtSecurityToken;
        if (jwtSecurityToken == null || !jwtSecurityToken.Header.Alg.Equals(SecurityAlgorithms.HmacSha256, StringComparison.InvariantCultureIgnoreCase))
            throw new SecurityTokenException("Invalid token");

        return principal;
    }
/*
    public async Task<string?> GetRefreshTokenAsync(string pseudo) {
        var member = await _context.Users.FindAsync(pseudo);
        return member?.RefreshToken;
    }

    public async Task SaveRefreshTokenAsync(string pseudo, string token) {
        var member = await _context.Users.FindAsync(pseudo);
        if (member != null) {
            member.RefreshToken = token;
            await _context.SaveChangesAsync();
        }
    }
*/

    public static string GetPasswordHash(string password) {
        string salt = "Peodks;zsOK30S,s";
        // derive a 256-bit subkey (use HMACSHA1 with 10,000 iterations)
        string hashed = Convert.ToBase64String(KeyDerivation.Pbkdf2(
            password: password,
            salt: Encoding.UTF8.GetBytes(salt),
            prf: KeyDerivationPrf.HMACSHA1,
            iterationCount: 10000,
            numBytesRequested: 256 / 8));
        return hashed;
    }
}
