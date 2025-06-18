# Settings System Documentation

This extendable settings system provides a flexible way to manage application configuration through the Filament admin panel and frontend.

## Features

- ✅ Multi-language support (English/Arabic)
- ✅ Multiple setting types (text, textarea, url, image, boolean, json, integer, float)
- ✅ Group-based organization
- ✅ Caching for performance
- ✅ Filament admin interface
- ✅ Frontend React hooks
- ✅ TypeScript support
- ✅ API endpoints

## Database Structure

The `settings` table includes:
- `key` - Unique identifier
- `group` - Organization group (general, appearance, seo, social, analytics, contact)
- `type` - Data type (text, textarea, url, image, boolean, json, integer, float)
- `value` - The setting value
- `label_en/label_ar` - Localized labels
- `description_en/description_ar` - Localized descriptions
- `is_required` - Whether the setting is required
- `display_order` - Display order within group

## Default Settings

The system comes with these pre-configured settings:

1. **Site Icon** - Upload site favicon
2. **Site Title** - Main website title
3. **Site Logo** - Website logo image
4. **Facebook Pixel URL** - Analytics tracking URL
5. **Maintenance Mode** - Enable/disable maintenance mode
6. **Contact Email** - Primary contact email
7. **Social Media Links** - JSON object with social media URLs

## Backend Usage

### Using the Settings Service

```php
use App\Services\SettingsService;

// Get a specific setting
$siteTitle = SettingsService::get('site_title', 'Default Title');

// Get settings by group
$generalSettings = SettingsService::getByGroup('general');

// Set a setting value
SettingsService::set('site_title', 'New Title');

// Get site configuration for frontend
$config = SettingsService::getSiteConfig();

// Check maintenance mode
$isMaintenanceMode = SettingsService::isMaintenanceMode();

// Get social links
$socialLinks = SettingsService::getSocialLinks();
```

### Using the Model Directly

```php
use App\Models\Setting;

// Get setting value with type casting
$setting = Setting::where('key', 'maintenance_mode')->first();
$isEnabled = $setting->value; // Automatically cast to boolean

// Create new setting
Setting::create([
    'key' => 'new_setting',
    'group' => 'general',
    'type' => 'text',
    'value' => 'Some value',
    'label_en' => 'New Setting',
    'label_ar' => 'إعداد جديد',
    'is_required' => false,
    'display_order' => 10,
]);
```

## Frontend Usage

### React Hooks

```tsx
import { useSettings, getSetting, useSiteBranding } from '@/hooks/useSettings';

function MyComponent() {
    // Get all settings
    const settings = useSettings();
    
    // Get specific setting with fallback
    const siteTitle = getSetting('site_title', 'Default Title');
    
    // Get branding information
    const { title, logo, icon } = useSiteBranding();
    
    return (
        <div>
            <h1>{title}</h1>
            {logo && <img src={logo} alt={title} />}
        </div>
    );
}
```

### UI Components

```tsx
import { 
    SiteLogo, 
    SiteIcon, 
    SocialLinks, 
    ContactInfo,
    MaintenanceWrapper 
} from '@/components/Settings/SettingsComponents';

function Header() {
    return (
        <header>
            <SiteLogo size="lg" showTitle={true} />
            <SocialLinks showLabels={false} />
            <ContactInfo />
        </header>
    );
}

function App() {
    return (
        <MaintenanceWrapper>
            <Header />
            {/* Your app content */}
        </MaintenanceWrapper>
    );
}
```

## API Endpoints

### Get All Public Settings
```http
GET /api/settings
```

### Get Settings by Group
```http
GET /api/settings/group/{group}
```

### Get Specific Setting
```http
GET /api/settings/{key}
```

## Filament Admin Interface

Navigate to `/admin/settings` to:
- View all settings organized by groups
- Create new settings with proper validation
- Edit existing settings with type-specific inputs
- Filter settings by group, type, or required status
- Bulk actions for management

## Adding New Settings

### Via Seeder

```php
// In SettingsSeeder.php
[
    'key' => 'new_setting_key',
    'group' => 'general',
    'type' => 'text',
    'value' => 'default_value',
    'label_en' => 'Setting Label',
    'label_ar' => 'تسمية الإعداد',
    'description_en' => 'Setting description',
    'description_ar' => 'وصف الإعداد',
    'is_required' => false,
    'display_order' => 1,
]
```

### Via Filament Admin

1. Go to Admin Panel → Settings
2. Click "Create Setting"
3. Fill in the form with appropriate values
4. Setting will be immediately available

## Setting Types

- **text** - Single line text input
- **textarea** - Multi-line text input
- **url** - URL input with validation
- **image** - File upload for images
- **boolean** - Toggle switch (true/false)
- **json** - Key-value pairs
- **integer** - Numeric input (whole numbers)
- **float** - Numeric input (decimals)

## Groups

Settings are organized into these groups:
- **general** - Basic site settings
- **appearance** - UI/UX settings
- **seo** - Search engine optimization
- **social** - Social media integration
- **analytics** - Tracking and analytics
- **contact** - Contact information
- **email** - Email configuration
- **payment** - Payment gateway settings

## Caching

The system automatically caches settings for 1 hour to improve performance. Cache is automatically cleared when:
- Settings are created, updated, or deleted
- Manual cache clear: `SettingsService::clearCache()`

## Localization

All settings support English and Arabic labels and descriptions. The frontend automatically uses the appropriate language based on the app locale.

## Security

- Settings are cached to prevent excessive database queries
- Only public settings are exposed via API
- Sensitive settings should not be exposed to frontend
- Use appropriate validation in Filament forms

## Extending the System

### Adding New Setting Types

1. Update the `type` enum in the migration
2. Add type handling in `Setting` model's `value()` accessor
3. Update the Filament form to handle the new type
4. Add frontend type handling if needed

### Adding New Groups

1. Update the group options in `SettingResource`
2. Add to cache clearing in `SettingsService`
3. Update seeder if needed

This system provides a solid foundation for managing application settings that can be easily extended as your application grows.
