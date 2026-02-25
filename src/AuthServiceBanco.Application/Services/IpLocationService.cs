using System.Text.Json;
using AuthServiceBanco.Application.Interfaces;

public class IpLocationService
{
    private readonly HttpClient _http;

    public IpLocationService(HttpClient http)
    {
        _http = http;
    }

    public async Task<string> GetCountryAsync(string ip)
    {
        var response = await _http.GetStringAsync($"http://ip-api.com/json/{ip}");
        using var json = JsonDocument.Parse(response);
        return json.RootElement.GetProperty("country").GetString() ?? "Desconocido";
    }
}
